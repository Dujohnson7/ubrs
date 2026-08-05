import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon, ChevronLeftIcon, EyeIcon, CheckCircleIcon } from "../../icons";
import GradesUploadModal from "./GradesUploadModal";

const sampleCourses = [
  { id: "1", courseId: "C101", courseName: "Mathematics", className: "Blue House", studentsEnrolled: 30, term: "Term 1", year: "AY2025", status: "Open", feedback: "On track" },
  { id: "2", courseId: "C102", courseName: "Science", className: "Red House", studentsEnrolled: 28, term: "Term 1", year: "AY2025", status: "Submitted", feedback: "Completed" },
];

const sampleGrades = [
  {
    id: "1",
    gradeId: "GR1001",
    studentName: "John Doe",
    courseName: "Mathematics",
    score: 92,
    grade: "A",
    comment: "Excellent work",
  },
];

export default function Grades() {
  const [grades, setGrades] = useState(sampleGrades);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [courses, setCourses] = useState(sampleCourses);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("All Students");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [gradeTypeFilter, setGradeTypeFilter] = useState("All Grades");
  const [academicYearFilter, setAcademicYearFilter] = useState("All Years");
  const [termFilter, setTermFilter] = useState("All Terms");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    setGrades((current) => current.filter((item) => item.id !== id));
  };

  const filteredGrades = useMemo(() => {
    const q = search.toLowerCase();
    return grades.filter((g) => {
      if (selectedCourse && g.courseName !== selectedCourse.courseName) return false;
      if (studentFilter !== "All Students" && g.studentName !== studentFilter) return false;
      if (classFilter !== "All Classes" && g.courseName !== classFilter) return false; // placeholder
      if (courseFilter !== "All Courses" && g.courseName !== courseFilter) return false;
      if (gradeTypeFilter !== "All Grades" && g.grade !== gradeTypeFilter) return false;
      if (academicYearFilter !== "All Years") return true; // placeholder
      if (termFilter !== "All Terms") return true; // placeholder
      if (!q) return true;
      return [g.gradeId, g.studentName, g.courseName, g.grade, String(g.score)].join(" ").toLowerCase().includes(q);
    });
  }, [grades, search, studentFilter, classFilter, courseFilter, gradeTypeFilter, academicYearFilter, termFilter, selectedCourse]);

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();
    return courses.filter((c) => {
      if (courseFilter !== "All Courses" && c.courseName !== courseFilter) return false;
      if (academicYearFilter !== "All Years" && c.year !== academicYearFilter) return false;
      if (termFilter !== "All Terms" && c.term !== termFilter) return false;
      if (!q) return true;
      return [c.courseId, c.courseName, c.term, c.year].join(" ").toLowerCase().includes(q);
    });
  }, [courses, search, courseFilter, academicYearFilter, termFilter]);

  const filtered = selectedCourse ? filteredGrades : filteredCourses;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageMeta title="Ubrs - Grades" description="Manage grades." /> 

      <div className="space-y-6">
        <ComponentCard title={selectedCourse ? `Grades: ${selectedCourse.courseName}` : "Grades by Course"} titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            {selectedCourse && (
              <div className="mb-4">
                <Button size="sm" variant="outline" startIcon={<ChevronLeftIcon className="size-4" />} onClick={() => { setSelectedCourse(null); setPage(1); }}>
                  Back to Courses
                </Button>
              </div>
            )}
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Entries</label>
                <Input placeholder={selectedCourse ? "Search grades..." : "Search courses..."} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              {selectedCourse && (
                <div>
                  <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Student</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={studentFilter} onChange={(e) => { setStudentFilter(e.target.value); setPage(1); }}>
                    <option>All Students</option>
                  </select>
                </div>
              )}
              {!selectedCourse && <div></div>}
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Class</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}>
                  <option>All Classes</option>
                </select>
              </div>
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Course</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}>
                  <option>All Courses</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsUploadModalOpen(true)}>Upload</Button>
                <Link to="/grades/create">
                  <Button size="sm">Add Grade</Button>
                </Link>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Grade Type</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={gradeTypeFilter} onChange={(e) => { setGradeTypeFilter(e.target.value); setPage(1); }}>
                  <option>All Grades</option>
                  <option>A</option>
                  <option>B</option>
                  <option>C</option>
                </select>
              </div>
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Academic Year</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={academicYearFilter} onChange={(e) => { setAcademicYearFilter(e.target.value); setPage(1); }}>
                    <option>All Years</option>
                    <option>AY2025</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Term</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={termFilter} onChange={(e) => { setTermFilter(e.target.value); setPage(1); }}>
                    <option>All Terms</option>
                    <option>Term 1</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {selectedCourse ? (
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Grade ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Student</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Course</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Score</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Grade</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Comment</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginated.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.id}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.gradeId}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.studentName}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.courseName}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.score}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.grade}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.comment}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" startIcon={<PencilIcon className="size-4" />} onClick={() => { sessionStorage.setItem("gradeEditItem", JSON.stringify(item)); navigate("/grades/edit", { state: { item } }); }} title="Edit" ariaLabel="Edit" className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200" />
                            <Button size="sm" variant="outline" startIcon={<TrashBinIcon className="size-4" />} onClick={() => handleDelete(item.id)} title="Delete" ariaLabel="Delete" className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Course ID</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Course Name</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Students</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Term</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Year</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Feedback</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginated.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.id}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.courseId}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{item.courseName}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.className}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.studentsEnrolled}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.term}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.year}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.feedback}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            item.status === "Submitted" ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400" :
                            item.status === "Open" ? "bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400" :
                            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}>{item.status}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" startIcon={<CheckCircleIcon className="size-4" />} onClick={() => console.log("Submit", item.id)} title="Submit Grade" ariaLabel="Submit Grade" className="!px-3 !py-2 !text-xs rounded-lg !bg-success-100/30 !text-success-700 hover:!bg-success-200">Submit</Button>
                            <Button size="sm" variant="outline" startIcon={<EyeIcon className="size-4" />} onClick={() => navigate("/grades/details", { state: { course: item } })} title="View Details" ariaLabel="View Details" className="!px-3 !py-2 !text-xs rounded-lg !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200">View</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
              <select className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="justify-self-center text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
                <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{currentPage}</span>
                <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Next</Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      <GradesUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </>
  );
}
