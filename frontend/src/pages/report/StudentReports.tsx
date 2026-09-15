import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { ClassInfo, buildStudentReportsFromGrades, printAllClassReports } from "./reportPrintUtils";
import { schoolClassService, SchoolClassResponseDto } from "../../services/schoolClassService";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { studentService } from "../../services/studentService";
import { studentReportService } from "../../services/studentReportService";
import { gradeService, ClassGradeStatusProjection } from "../../services/gradeService";
import { toast } from "../../utils/toast";
import { loadReportSignatories } from "./reportSignatures";
import { useAuth } from "../../hooks/useAuth";
import { ERole } from "../../services/authService";

type ClassRow = ClassInfo & { classLevel: string; hasGrades: boolean; approvedSubjects: number };

const formatLevel = (level?: string) => {
  if (!level) return "—";
  if (level === "PRIMARY") return "Primary";
  if (level === "NURSERY") return "Nursery";
  return level;
};

export default function StudentReports() {
  const { user } = useAuth();
  const isClassTeacher = user?.role === ERole.CLASSTEACHER;

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [termFilter, setTermFilter] = useState("TERM1");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const [years, setYears] = useState<AcademicYearResponseDto[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classGrades, setClassGrades] = useState<ClassGradeStatusProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingClassId, setPrintingClassId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [yearsData, classesData, studentsData, classGradeData] = await Promise.all([
          academicYearService.getAllAcademicYears(),
          schoolClassService.getAllSchoolClasses(),
          studentService.getAllStudents(),
          gradeService.getClassGradeStatus(),
        ]);
        setYears(yearsData);
        setClassGrades(classGradeData);

        const active = yearsData.find((y) => y.academicYearStatus === "ACTIVE");
        const defaultYear = active?.academicYearId || yearsData[0]?.academicYearId || "";
        setYearFilter(defaultYear);

        const countByClass = studentsData.reduce<Record<string, number>>((acc, s) => {
          acc[s.schoolClassId] = (acc[s.schoolClassId] || 0) + 1;
          return acc;
        }, {});

        const defaultYearLabel =
          yearsData.find((y) => y.academicYearId === defaultYear)?.fiscalYear || "";

        const visibleClasses = isClassTeacher && user?.userId
          ? classesData.filter((c: SchoolClassResponseDto) => c.classTeacherId === user.userId || (user?.names && c.classTeacherName === user.names))
          : classesData;

        setClasses(
          visibleClasses.map((c: SchoolClassResponseDto) => ({
            id: c.schoolClassId,
            classId: c.schoolClassId.slice(0, 8).toUpperCase(),
            name: c.name,
            level: formatLevel(c.classLevel),
            classLevel: formatLevel(c.classLevel),
            classTeacher: c.classTeacherName || "—",
            classTeacherId: c.classTeacherId,
            studentCount: countByClass[c.schoolClassId] || 0,
            academicYear: defaultYearLabel,
            academicYearId: defaultYear,
            term: "",
            hasGrades: false,
            approvedSubjects: 0,
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isClassTeacher, user?.userId, user?.names]);

  const selectedYear = years.find((y) => y.academicYearId === yearFilter);

  const classesForYear = useMemo(() => {
    return classes.map((c) => {
      const matches = classGrades.filter(
        (g) => g.classId === c.id && (!yearFilter || g.academicYearId === yearFilter)
      );
      const approvedSubjects = matches.reduce((sum, g) => sum + (g.approved || 0), 0);
      const hasGrades = matches.length > 0;
      return {
        ...c,
        academicYear: selectedYear?.fiscalYear || c.academicYear,
        academicYearId: yearFilter || c.academicYearId,
        hasGrades,
        approvedSubjects,
      };
    });
  }, [classes, classGrades, yearFilter, selectedYear]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return classesForYear.filter((c) => {
      if (levelFilter !== "All Levels" && !c.classLevel.startsWith(levelFilter)) return false;
      if (classFilter !== "All Classes" && c.name !== classFilter) return false;
      if (!q) return true;
      return [c.classId, c.name, c.classLevel, c.classTeacher].join(" ").toLowerCase().includes(q);
    });
  }, [classesForYear, search, levelFilter, classFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toClassInfo = (item: ClassRow): ClassInfo => ({
    id: item.id,
    classId: item.classId,
    name: item.name,
    level: item.level,
    classLevel: item.classLevel,
    classTeacher: item.classTeacher,
    classTeacherId: item.classTeacherId,
    classTeacherSignature: item.classTeacherSignature,
    headteacher: item.headteacher,
    headteacherSignature: item.headteacherSignature,
    studentCount: item.studentCount,
    academicYear: selectedYear?.fiscalYear || item.academicYear,
    academicYearId: yearFilter || item.academicYearId,
    term: termFilter || undefined,
  });

  const withSignatories = async (item: ClassRow): Promise<ClassInfo> => {
    const base = toClassInfo(item);
    const signatories = await loadReportSignatories(item.id, base.classTeacher);
    return {
      ...base,
      classTeacherId: signatories.classTeacherId,
      classTeacher: signatories.classTeacher || base.classTeacher,
      classTeacherSignature: signatories.classTeacherSignature,
      headteacher: signatories.headteacher,
      headteacherSignature: signatories.headteacherSignature,
    };
  };

  const handleView = async (item: ClassRow) => {
    if (!yearFilter) {
      toast.error("Select an academic year first");
      return;
    }
    if (!termFilter) {
      toast.error("Select a term first");
      return;
    }
    try {
      const classData = await withSignatories(item);
      navigate(`/student-reports/${item.id}`, { state: { classData } });
    } catch {
      navigate(`/student-reports/${item.id}`, { state: { classData: toClassInfo(item) } });
    }
  };

  const handlePrintAll = async (item: ClassRow) => {
    if (!yearFilter) {
      toast.error("Select an academic year first");
      return;
    }
    if (!termFilter) {
      toast.error("Select a term first");
      return;
    }
    setPrintingClassId(item.id);
    try {
      const classInfo = await withSignatories(item);
      const rows = (isClassTeacher && user?.userId)
        ? await studentReportService.getStudentGradeReportByClassTeacher(user.userId, yearFilter)
        : await studentReportService.getStudentGradeReport(yearFilter, item.id);
      const reports = buildStudentReportsFromGrades(classInfo, rows, termFilter);
      if (reports.length === 0) {
        toast.error(`No APPROVED grades for ${item.name} in ${selectedYear?.fiscalYear || "this year"} (${termFilter === "TERM3" ? "full year" : termFilter})`);
        return;
      }
      printAllClassReports(classInfo, reports);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reports for printing");
    } finally {
      setPrintingClassId(null);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <>
      <PageMeta title="Ubrs - Student Reports" description="View and print student report cards by class." />

      <div className="space-y-6">
        <ComponentCard title="Student Reports" titleClassName="text-xl sm:text-2xl">
           

          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Search Classes
                </label>
                <Input
                  placeholder="Search by class name, teacher..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Level
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={levelFilter}
                  onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                >
                  <option>All Levels</option>
                  <option>Primary</option>
                  <option>Nursery</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Class
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={classFilter}
                  onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                >
                  <option>All Classes</option>
                  {[...new Set(classesForYear.map(c => c.name))].sort().map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Term
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={termFilter}
                  onChange={(e) => { setTermFilter(e.target.value); setPage(1); }}
                >
                  <option value="TERM1">Term 1 </option>
                  <option value="TERM2">Term 2 </option>
                  <option value="TERM3">Term 3 </option>
                </select>
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Academic Year
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={yearFilter}
                  onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y.academicYearId} value={y.academicYearId}>
                      {y.fiscalYear}{y.academicYearStatus === "ACTIVE" ? " (Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell> 
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Level</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class Teacher</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Students</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Approved Subjects</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Year</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-10 text-center text-gray-400 text-theme-sm" colSpan={9}>
                        No classes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((item, idx) => (
                      <TableRow key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </TableCell> 
                        <TableCell className="px-5 py-4 font-semibold text-gray-800 text-start text-theme-sm dark:text-white/90">
                          {item.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.classLevel}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                          {item.classTeacher}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="inline-flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-200">
                            {item.studentCount}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.approvedSubjects > 0
                              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {item.approvedSubjects}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {selectedYear?.fiscalYear || "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="flex flex-wrap gap-2">
                            <button
                              id={`view-class-${item.id}`}
                              onClick={() => handleView(item)}
                              title="View Students"
                              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50"
                            >
                              View Details
                            </button>
                            <button
                              id={`print-class-${item.id}`}
                              onClick={() => handlePrintAll(item)}
                              disabled={printingClassId === item.id || item.approvedSubjects === 0}
                              title={item.approvedSubjects === 0 ? "No approved subjects yet" : "Print All Reports"}
                              className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3.5 py-2 text-xs font-semibold text-success-700 hover:bg-success-100 transition-colors dark:bg-success-900/30 dark:text-success-300 dark:hover:bg-success-900/50 disabled:opacity-50"
                            >
                              {printingClassId === item.id ? "Loading..." : "Print All"}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
              <select
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="justify-self-center">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
                <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm">{currentPage}</span>
                <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Next</Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
