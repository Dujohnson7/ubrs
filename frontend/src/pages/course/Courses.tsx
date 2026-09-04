import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { courseService, CourseResponseDto, ESchoolLevel } from "../../services/courseService";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { useAuth } from "../../hooks/useAuth";
import { ERole } from "../../services/authService";

export default function Courses() {
  const { user } = useAuth();
  const isAdmin = user?.role === ERole.HEADERTEACHER;
  const isTeacherRole = user?.role === ERole.TEACHER || user?.role === ERole.CLASSTEACHER;
  const [courses, setCourses] = useState<CourseResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "PRIMARY" | "NURSERY">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        let data;
        // Teachers see only their assigned courses; admins can filter by level
        if (isTeacherRole && user?.userId) {
          data = await courseService.getCoursesByTeacher(user.userId);
        } else if (levelFilter === "PRIMARY") {
          data = await courseService.getPrimaryCourses();
        } else if (levelFilter === "NURSERY") {
          data = await courseService.getNurseryCourses();
        } else {
          data = await courseService.getAllCourses();
        }
        setCourses(data);
      } catch (err) {
        // Error is handled by toast in service
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [levelFilter, isTeacherRole, user?.userId]);

  const handleDelete = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await courseService.deleteCourse(courseToDelete);
      setCourses((current) => current.filter((item) => item.courseId !== courseToDelete));
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return courses.filter((c) => {
      if (!q) return true;
      return [c.courseId, c.courseName, c.courseCode, c.courseLevel].join(" ").toLowerCase().includes(q);
    });
  }, [courses, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageMeta title="Ubrs - Courses" description="Manage courses." /> 

      <div className="space-y-6">
        <ComponentCard title="Courses" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Entries</label>
                <Input placeholder="Search courses..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Level</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value as "ALL" | "PRIMARY" | "NURSERY"); setPage(1); }}>
                  <option value="ALL">All Levels</option>
                  <option value="PRIMARY">Primary</option>
                  <option value="NURSERY">Nursery</option>
                </select>
              </div>
              {!isTeacherRole && (
                <div className="flex justify-end">
                  <Link to="/courses/create">
                    <Button size="sm">Add Course</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Course Code</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Course Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Course Hours</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Level</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.map((item, index) => (
                    <TableRow key={item.courseId}>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.courseCode}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.courseName}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.courseHours}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.courseLevel}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex flex-wrap gap-2">
                          {isAdmin && (
                            <>
                              <Button size="sm" variant="outline" startIcon={<PencilIcon className="size-4" />} onClick={() => { sessionStorage.setItem("courseEditItem", JSON.stringify(item)); navigate("/courses/edit", { state: { item } }); }} title="Edit" ariaLabel="Edit" className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200" />
                              <Button size="sm" variant="outline" startIcon={<TrashBinIcon className="size-4" />} onClick={() => handleDelete(item.courseId)} title="Delete" ariaLabel="Delete" className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200" />
                            </>
                          )}
                          {isTeacherRole && (
                            <span className="text-xs text-gray-400 italic">View only</span>
                          )}
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
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
