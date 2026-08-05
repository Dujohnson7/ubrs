import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon, ChevronLeftIcon } from "../../icons";

const sampleGrades = [
  { id: "1", gradeId: "GR1001", studentName: "John Doe", class: "Blue House", courseName: "Mathematics", score: 92, grade: "A", comment: "Excellent work", gradeType: "Exam" },
  { id: "2", gradeId: "GR1002", studentName: "Jane Smith", class: "Blue House", courseName: "Mathematics", score: 78, grade: "B", comment: "Good", gradeType: "CAT" },
  { id: "3", gradeId: "GR1003", studentName: "Mike Johnson", class: "Blue House", courseName: "Mathematics", score: 65, grade: "C", comment: "Needs improvement", gradeType: "Assignment" },
  { id: "4", gradeId: "GR1004", studentName: "Alice Brown", class: "Red House", courseName: "Mathematics", score: 88, grade: "A", comment: "Very good", gradeType: "Exam" },
  { id: "5", gradeId: "GR1005", studentName: "Bob Mugisha", class: "Green House", courseName: "Mathematics", score: 55, grade: "C", comment: "Improving", gradeType: "CAT" },
];

export default function GradeDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;

  const [grades, setGrades] = useState(sampleGrades);
  const [search, setSearch] = useState("");
  const [gradeTypeFilter, setGradeTypeFilter] = useState("All Types");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleDelete = (id: string) => {
    setGrades((current) => current.filter((item) => item.id !== id));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return grades.filter((g) => {
      if (gradeTypeFilter !== "All Types" && g.gradeType !== gradeTypeFilter) return false;
      if (!q) return true;
      return [g.gradeId, g.studentName, g.class, g.grade, String(g.score)].join(" ").toLowerCase().includes(q);
    });
  }, [grades, search, gradeTypeFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectCls = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <>
      <PageMeta title={`Ubrs - Grades: ${course?.courseName ?? "Details"}`} description="View student grades for this course." />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="outline" startIcon={<ChevronLeftIcon className="size-4" />} onClick={() => navigate("/grades")}>
            Back to Courses
          </Button>
        </div>

        <ComponentCard
          title="Student Grades"
          titleClassName="text-xl sm:text-2xl"
        >
          {/* Course info + Filters panel */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Course header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {course?.courseName ?? "Course"} — Student Grades
                </h2>
                {course && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {course.term} · {course.year} · {course.studentsEnrolled} students enrolled
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                  {filtered.length} records
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Students</label>
                <Input placeholder="Search by name, ID, grade..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Grade Type</label>
                <select className={selectCls} value={gradeTypeFilter} onChange={(e) => { setGradeTypeFilter(e.target.value); setPage(1); }}>
                  <option>All Types</option>
                  <option>CAT</option>
                  <option>Exam</option>
                  <option>Assignment</option>
                </select>
              </div>
              <div className="flex justify-end">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filtered.length} student{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Grade ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Student</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Grade Type</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Score</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Grade</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Comment</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.map((item, idx) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                          {item.gradeId}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{item.studentName}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.class}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.gradeType === "Exam" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                          item.gradeType === "CAT" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}>{item.gradeType}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <span className={`font-semibold ${item.score >= 80 ? "text-success-600" : item.score >= 60 ? "text-warning-600" : "text-error-600"}`}>{item.score}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.grade === "A" ? "bg-success-100 text-success-700" :
                          item.grade === "B" ? "bg-brand-100 text-brand-700" :
                          "bg-warning-100 text-warning-700"
                        }`}>{item.grade}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[180px] truncate">{item.comment}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" startIcon={<PencilIcon className="size-4" />} onClick={() => {}} title="Edit" ariaLabel="Edit" className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200" />
                          <Button size="sm" variant="outline" startIcon={<TrashBinIcon className="size-4" />} onClick={() => handleDelete(item.id)} title="Delete" ariaLabel="Delete" className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell className="px-5 py-8 text-center text-gray-400 dark:text-gray-600" colSpan={9}>No grade records found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
              <select className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{currentPage}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Next</Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
