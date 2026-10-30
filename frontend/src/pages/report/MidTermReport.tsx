import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { schoolClassService, SchoolClassResponseDto } from "../../services/schoolClassService";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { studentService } from "../../services/studentService";
import { gradeService, ClassGradeStatusProjection } from "../../services/gradeService";
import { midTermReportService } from "../../services/midTermReportService";
import { loadReportSignatories } from "./reportSignatures";
import { toast } from "../../utils/toast";
import { useAuth } from "../../hooks/useAuth";
import { ERole } from "../../services/authService";

const formatLevel = (level?: string) => {
  if (!level) return "—";
  if (level === "PRIMARY") return "Primary";
  if (level === "NURSERY") return "Nursery";
  return level;
};

const formatTerm = (t?: string) => (t || "").replace(/^TERM(\d)$/i, "Term $1") || "—";

interface ClassRow {
  id: string;
  classId: string;
  name: string;
  level: string;
  classLevel: string;
  classTeacher: string;
  classTeacherId?: string;
  studentCount: number;
  academicYear: string;
  academicYearId: string;
  term: string;
  subjects: number;
}

export default function MidTermReport() {
  const { user } = useAuth();
  const isClassTeacher = user?.role === ERole.CLASSTEACHER;
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [termFilter, setTermFilter] = useState("TERM1");
  const [yearFilter, setYearFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [years, setYears] = useState<AcademicYearResponseDto[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classGrades, setClassGrades] = useState<ClassGradeStatusProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [printingClassId, setPrintingClassId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [yearsData, classesData, studentsData] = await Promise.all([
          academicYearService.getAllAcademicYears(),
          schoolClassService.getAllSchoolClasses(),
          studentService.getAllStudents(),
        ]);

        let midTermGrades: ClassGradeStatusProjection[] = [];
        try {
          if (isClassTeacher && user?.userId) {
            midTermGrades = await gradeService.getClassMidTermGradesByClassTeacher(user.userId);
          } else {
            midTermGrades = await gradeService.getClassMidTermGrades();
          }
        } catch (e) {
          console.warn("Could not load mid-term grade status from gradeService:", e);
        }

        setYears(yearsData);
        setClassGrades(midTermGrades);

        const active = yearsData.find((y) => y.academicYearStatus === "ACTIVE");
        const defaultYear = active?.academicYearId || yearsData[0]?.academicYearId || "";
        setYearFilter(defaultYear);

        const countByClass = studentsData.reduce<Record<string, number>>((acc, s) => {
          acc[s.schoolClassId] = (acc[s.schoolClassId] || 0) + 1;
          return acc;
        }, {});

        const defaultYearLabel =
          yearsData.find((y) => y.academicYearId === defaultYear)?.fiscalYear || "";

        const visibleClasses =
          isClassTeacher && user?.userId
            ? classesData.filter(
                (c: SchoolClassResponseDto) =>
                  c.classTeacherId === user.userId ||
                  (user?.names && c.classTeacherName === user.names)
              )
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
            term: termFilter,
            subjects: 0,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load initial mid-term report data");
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
        (g) =>
          g.classId?.toLowerCase() === c.id?.toLowerCase() &&
          (!yearFilter || g.academicYearId?.toLowerCase() === yearFilter?.toLowerCase()) &&
          (!termFilter || g.term?.toUpperCase() === termFilter?.toUpperCase())
      );
      const subjects = matches.reduce(
        (sum, g) => sum + Number(g.subjects ?? g.approved ?? 0),
        0
      );
      return {
        ...c,
        academicYear: selectedYear?.fiscalYear || c.academicYear,
        academicYearId: yearFilter || c.academicYearId,
        term: termFilter,
        subjects,
      };
    });
  }, [classes, classGrades, yearFilter, termFilter, selectedYear]);

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

  const handleView = (item: ClassRow) => {
    if (!yearFilter) {
      toast.error("Select an academic year first");
      return;
    }
    navigate("/midterm-reports/detail", {
      state: {
        classId: item.id,
        className: item.name,
        classLevel: item.classLevel,
        classTeacher: item.classTeacher,
        classTeacherId: item.classTeacherId,
        academicYearId: yearFilter || item.academicYearId,
        academicYear: selectedYear?.fiscalYear || item.academicYear,
        term: termFilter,
        studentCount: item.studentCount,
      },
    });
  };

  const handlePrintAll = async (item: ClassRow) => {
    if (!yearFilter) {
      toast.error("Select an academic year first");
      return;
    }
    setPrintingClassId(item.id);
    try {
      const [data, signatories] = await Promise.all([
        midTermReportService.getMidTermReportByTerm(yearFilter, item.id, termFilter),
        loadReportSignatories(item.id, item.classTeacher),
      ]);

      if (!data || data.length === 0) {
        toast.error(`No mid-term assessment data found for ${item.name} (${formatTerm(termFilter)})`);
        return;
      }

      const courseMap = new Map<string, { courseId: string; name: string; maxMark: number | null }>();
      const studentMap = new Map<
        string,
        {
          code: string;
          name: string;
          marks: Map<string, number | null>;
        }
      >();

      for (const r of data) {
        if (!courseMap.has(r.courseId)) {
          courseMap.set(r.courseId, { courseId: r.courseId, name: r.courseName, maxMark: r.midTermMaxMark });
        } else if (courseMap.get(r.courseId)!.maxMark == null && r.midTermMaxMark != null) {
          courseMap.get(r.courseId)!.maxMark = r.midTermMaxMark;
        }

        if (!studentMap.has(r.studentId)) {
          studentMap.set(r.studentId, {
            code: r.studentCode || "—",
            name: r.studentName || "—",
            marks: new Map(),
          });
        }
        studentMap.get(r.studentId)!.marks.set(r.courseId, r.midTermMark);
      }

      const courses = Array.from(courseMap.values()).sort((a, b) => a.name.localeCompare(b.name));
      const students = Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));

      const totalPossibleMax = courses.reduce((acc, c) => acc + (c.maxMark ?? 0), 0);
      const logoSrc = `${window.location.origin}/images/logo/logo.png`;
      const termLabel = formatTerm(termFilter);
      const yearLabel = selectedYear?.fiscalYear || item.academicYear;

      const courseHeadersHtml = courses
        .map(
          (c) =>
            `<th style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px;">
              ${c.name}<br/><span style="font-weight:normal;font-size:10px;">(/${c.maxMark ?? "—"})</span>
            </th>`
        )
        .join("");

      const tableRowsHtml = students
        .map((s, idx) => {
          let studentTotal = 0;
          const courseCells = courses
            .map((c) => {
              const m = s.marks.get(c.courseId);
              if (m != null) studentTotal += m;
              return `<td style="padding:5px 4px;border:1px solid #000;text-align:center;font-size:11px;font-weight:bold;">
                ${m != null ? m : "—"}
              </td>`;
            })
            .join("");

          const pct = totalPossibleMax > 0 ? ((studentTotal / totalPossibleMax) * 100).toFixed(1) + "%" : "—";

          return `
            <tr>
              <td style="padding:5px 4px;border:1px solid #000;text-align:center;font-size:11px;">${idx + 1}</td>
              <td style="padding:5px 6px;border:1px solid #000;font-size:11px;white-space:nowrap;">${s.code}</td>
              <td style="padding:5px 8px;border:1px solid #000;font-size:11px;white-space:nowrap;font-weight:bold;">${s.name}</td>
              ${courseCells}
              <td style="padding:5px 4px;border:1px solid #000;text-align:center;font-size:11px;font-weight:bold;">${studentTotal.toFixed(1)}</td>
              <td style="padding:5px 4px;border:1px solid #000;text-align:center;font-size:11px;font-weight:bold;">${pct}</td>
            </tr>`;
        })
        .join("");

      const teacherName = signatories?.classTeacher || item.classTeacher;
      const teacherSig = signatories?.classTeacherSignature || "";
      const headName = signatories?.headteacher || "Head Teacher";
      const headSig = signatories?.headteacherSignature || "";

      const html = `<!DOCTYPE html>
      <html>
        <head>
          <title>Mid-Term Assessment Report — ${item.name}</title>
          <meta charset="UTF-8"/>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            body { margin: 0; padding: 10px; background: #fff; font-family: 'Times New Roman', Times, serif; color: #000; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div style="max-width:100%; margin:0 auto; background:#fff; border:2px solid #000;">
            <div style="padding:14px 20px; border-bottom:2px solid #000; display:flex; align-items:center; justify-content:space-between; gap:20px;">
              <img src="${logoSrc}" alt="Logo" style="width:70px; height:70px; object-fit:contain; border:1px solid #000; padding:4px;" />
              <div style="text-align:center; flex:1;">
                <div style="font-size:16px; font-weight:900; letter-spacing:0.5px; text-transform:uppercase;">REPUBLIC OF RWANDA</div>
                <div style="font-size:15px; font-weight:900; margin-top:2px;">MINISTRY OF EDUCATION</div>
                <div style="font-size:15px; font-weight:700; margin-top:3px; text-transform:uppercase; letter-spacing:0.5px; color:#1e3e6e;">UMWANA BRIGHT ACADEMY</div>
              </div>
              <div style="width:70px;"></div>
            </div>

            <div style="padding:12px 16px; border-bottom:2px solid #000; background:#fafafa;">
              <div style="text-align:center; font-size:15px; font-weight:bold; text-transform:uppercase; margin-bottom:10px; text-decoration:underline;">
                Class Mid-Term Report
              </div>
              <table style="width:100%; font-size:12px; line-height:1.6;">
                <tr>
                  <td style="width:50%;"><strong>Class:</strong> ${item.name} (${item.classLevel})</td>
                  <td style="width:50%;"><strong>Term / Year:</strong> ${termLabel} / ${yearLabel}</td>
                </tr>
                <tr>
                  <td><strong>Class Teacher:</strong> ${teacherName}</td>
                  <td><strong>Students:</strong> ${students.length} &nbsp;|&nbsp; <strong>Courses Evaluated:</strong> ${courses.length} (Max: ${totalPossibleMax})</td>
                </tr>
              </table>
            </div>

            <div style="padding:12px;">
              <table style="width:100%; border-collapse:collapse; font-size:11px;">
                <thead>
                  <tr style="background:#000; color:#fff;">
                    <th style="padding:6px 4px;border:1px solid #000;text-align:center;width:32px;">#</th>
                    <th style="padding:6px 6px;border:1px solid #000;text-align:left;white-space:nowrap;">Reg No</th>
                    <th style="padding:6px 8px;border:1px solid #000;text-align:left;white-space:nowrap;">Student Name</th>
                    ${courseHeadersHtml}
                    <th style="padding:6px 4px;border:1px solid #000;text-align:center;white-space:nowrap;">Total<br/><span style="font-weight:normal;font-size:10px;">(/${totalPossibleMax})</span></th>
                    <th style="padding:6px 4px;border:1px solid #000;text-align:center;width:48px;">%</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRowsHtml}
                </tbody>
              </table>
            </div>

            <div style="padding:24px 40px; display:flex; justify-content:space-between; font-size:12px; margin-top:10px;">
              <div style="text-align:center; min-width:200px; max-width:260px;">
                <div style="font-size:13px; font-weight:bold; color:#000;">${teacherName}</div> 
                <div style="min-height:46px; display:flex; align-items:center; justify-content:center; margin:6px 0;">
                  ${
                    teacherSig
                      ? `<img src="${teacherSig}" alt="Signature" style="max-height:44px; max-width:180px; object-fit:contain;" />`
                      : `<div style="height:32px;"></div>`
                  }
                </div>
                <div style="border-top:1px solid #000; padding-top:4px;"><strong>Class Teacher Signature</strong></div>
              </div>

              <div style="text-align:center; min-width:200px; max-width:260px;">
                <div style="font-size:13px; font-weight:bold; color:#000;">${headName}</div> 
                <div style="min-height:46px; display:flex; align-items:center; justify-content:center; margin:6px 0;">
                  ${
                    headSig
                      ? `<img src="${headSig}" alt="Signature" style="max-height:44px; max-width:180px; object-fit:contain;" />`
                      : `<div style="height:32px;"></div>`
                  }
                </div>
                <div style="border-top:1px solid #000; padding-top:4px;"><strong>Head Teacher Signature</strong></div>
              </div>
            </div>
          </div>
        </body>
      </html>`;

      const win = window.open("", "_blank", "width=1250,height=850");
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 650);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate class mid-term assessment document.");
    } finally {
      setPrintingClassId(null);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading mid-term reports...</div>;
  }

  return (
    <>
      <PageMeta
        title="Ubrs - Mid-Term Reports"
        description="View and print student mid-term assessment reports by class."
      />

      <div className="space-y-6">
        <ComponentCard title="Mid-Term Reports" titleClassName="text-xl sm:text-2xl">
          {/* Filters Bar: matching StudentReports 5-column grid */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Search Classes
                </label>
                <Input
                  placeholder="Search by class name, teacher..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Level
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={levelFilter}
                  onChange={(e) => {
                    setLevelFilter(e.target.value);
                    setPage(1);
                  }}
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
                  onChange={(e) => {
                    setClassFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>All Classes</option>
                  {[...new Set(classesForYear.map((c) => c.name))].sort().map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
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
                  onChange={(e) => {
                    setTermFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="TERM1">Term 1</option>
                  <option value="TERM2">Term 2</option>
                  <option value="TERM3">Term 3</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Academic Year
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y.academicYearId} value={y.academicYearId}>
                      {y.fiscalYear}
                      {y.academicYearStatus === "ACTIVE" ? " (Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table: matching StudentReports design */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      #
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Class Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Level
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Class Teacher
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Students
                    </TableCell>   
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Academic Year
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell
                        className="px-5 py-10 text-center text-gray-400 text-theme-sm"
                        colSpan={7}
                      >
                        No classes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((item, idx) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
                      >
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
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {selectedYear?.fiscalYear + " / " + formatTerm(termFilter)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="flex flex-wrap gap-2">
                            <button
                              id={`view-midterm-${item.id}`}
                              onClick={() => handleView(item)}
                              disabled={ item.subjects === 0}
                              title="View Mid-Term Assessment Details"
                              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50  disabled:opacity-50"
                            >
                              View Details
                            </button>
                            <button
                              id={`print-midterm-${item.id}`}
                              onClick={() => handlePrintAll(item)}
                              disabled={printingClassId === item.id || item.subjects === 0}
                              title="Download & Print Mid-Term Assessment Report"
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

          {/* Pagination */}
          <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
              </span>
              <select
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="justify-self-center">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm">
                  {currentPage} of {pageCount}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                  disabled={currentPage === pageCount}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
