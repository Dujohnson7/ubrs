import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { courseAssignmentService, CourseAssignmentResponseDto, EAssignmentState } from "../../services/courseAssignmentService";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import { PencilIcon, TrashBinIcon, CloseIcon } from "../../icons";
import { toast } from "../../utils/toast";

export default function Assignments() {
  const [assignments, setAssignments] = useState<CourseAssignmentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EAssignmentState>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [assignmentToClose, setAssignmentToClose] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const data = await courseAssignmentService.getAllCourseAssignments();
        setAssignments(data);
      } catch (err) {
        // Error is handled by toast in service
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const handleDelete = (courseAssignmentId: string) => {
    setAssignmentToDelete(courseAssignmentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      await courseAssignmentService.deleteCourseAssignment(assignmentToDelete);
      setAssignments((current) => current.filter((item) => item.courseAssignmentId !== assignmentToDelete));
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setAssignmentToDelete(null);
  };

  const handleCloseAssignment = (courseAssignmentId: string) => {
    setAssignmentToClose(courseAssignmentId);
    setCloseDialogOpen(true);
  };

  const confirmCloseAssignment = async () => {
    if (!assignmentToClose) return;

    try {
      await courseAssignmentService.closeCourseAssignment(assignmentToClose);
      setAssignments((current) => current.map((item) =>
        item.courseAssignmentId === assignmentToClose
          ? { ...item, assignmentStatus: EAssignmentState.CLOSED }
          : item
      ));
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setCloseDialogOpen(false);
      setAssignmentToClose(null);
    }
  };

  const cancelCloseAssignment = () => {
    setCloseDialogOpen(false);
    setAssignmentToClose(null);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assignments.filter((a) => {
      if (teacherFilter !== "ALL" && a.teacherName !== teacherFilter) return false;
      if (classFilter !== "ALL" && a.schoolClassName !== classFilter) return false;
      if (courseFilter !== "ALL" && a.courseName !== courseFilter) return false;
      if (statusFilter !== "ALL" && a.assignmentStatus !== statusFilter) return false;
      if (fromDate && new Date(a.assignmentDate) < new Date(fromDate)) return false;
      if (toDate && new Date(a.assignmentDate) > new Date(toDate)) return false;
      if (!q) return true;
      return [a.teacherName, a.schoolClassName, a.courseName, a.assignmentStatus].join(" ").toLowerCase().includes(q);
    });
  }, [assignments, search, teacherFilter, classFilter, courseFilter, statusFilter, fromDate, toDate]);

  const uniqueTeachers = useMemo(() => {
    const teachers = new Set(assignments.map((a) => a.teacherName));
    return Array.from(teachers).sort();
  }, [assignments]);

  const uniqueClasses = useMemo(() => {
    const classes = new Set(assignments.map((a) => a.schoolClassName));
    return Array.from(classes).sort();
  }, [assignments]);

  const uniqueCourses = useMemo(() => {
    const courses = new Set(assignments.map((a) => a.courseName));
    return Array.from(courses).sort();
  }, [assignments]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageMeta title="Ubrs - Class Assignments" description="Manage class assignments." />
       

      <div className="space-y-6">
        <ComponentCard title="Class Assignments" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Entries</label>
                <Input placeholder="Search assignments..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Teacher</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={teacherFilter} onChange={(e) => { setTeacherFilter(e.target.value); setPage(1); }}>
                  <option value="ALL">All Teachers</option>
                  {uniqueTeachers.map((teacher) => (
                    <option key={teacher} value={teacher}>{teacher}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Class</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}>
                  <option value="ALL">All Classes</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Course</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}>
                  <option value="ALL">All Courses</option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <Link to="/assignments/create">
                  <Button size="sm">Add Assignment</Button>
                </Link>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Status</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as "ALL" | EAssignmentState); setPage(1); }}>
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">From</label>
                  <DatePicker id="from" label="From" placeholder="Start date" defaultDate={fromDate || undefined} onChange={(dates) => { setFromDate(dates.length ? dates[0].toISOString().split("T")[0] : ""); setPage(1); }} />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">To</label>
                  <DatePicker id="to" label="To" placeholder="End date" defaultDate={toDate || undefined} onChange={(dates) => { setToDate(dates.length ? dates[0].toISOString().split("T")[0] : ""); setPage(1); }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Teacher</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Course</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Assignment Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Closed Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.map((item, index) => (
                    <TableRow key={item.courseAssignmentId}>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.teacherName}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.schoolClassName}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.courseName}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.assignmentDate}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.closedDate || "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-start text-theme-sm dark:text-gray-400">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.assignmentStatus === EAssignmentState.ACTIVE
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {item.assignmentStatus}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" startIcon={<PencilIcon className="size-4" />} onClick={() => { sessionStorage.setItem("assignmentEditItem", JSON.stringify(item)); navigate("/assignments/edit", { state: { item } }); }} title="Edit" ariaLabel="Edit" className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200" />
                          <Button size="sm" variant="outline" startIcon={<CloseIcon className="size-4" />} onClick={() => handleCloseAssignment(item.courseAssignmentId)} disabled={item.assignmentStatus === EAssignmentState.CLOSED} title="Close Assignment" ariaLabel="Close Assignment" className="!px-3 !py-3 !min-w-0 rounded-full !bg-warning-100/20 !text-warning-600 hover:!bg-warning-200" />
                          <Button size="sm" variant="outline" startIcon={<TrashBinIcon className="size-4" />} onClick={() => handleDelete(item.courseAssignmentId)} title="Delete" ariaLabel="Delete" className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <ConfirmDialog
        isOpen={closeDialogOpen}
        title="Close Assignment"
        message="Are you sure you want to close this assignment?"
        onConfirm={confirmCloseAssignment}
        onCancel={cancelCloseAssignment}
        confirmText="Close"
        cancelText="Cancel"
      />
    </>
  );
}
