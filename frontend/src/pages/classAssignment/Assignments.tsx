import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import { PencilIcon, TrashBinIcon, CloseIcon, CopyIcon } from "../../icons";

const sampleAssignments = [
  {
    id: "1",
    assignmentId: "ASG1001",
    studentName: "John Doe",
    className: "Blue House",
    courseName: "Mathematics",
    assignedDate: "2025-03-10",
    dueDate: "2025-03-20",
    status: "Open",
  },
];

export default function Assignments() {
  const [assignments, setAssignments] = useState(sampleAssignments);
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("All Teachers");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    setAssignments((current) => current.filter((item) => item.id !== id));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assignments.filter((a) => {
      if (teacherFilter !== "All Teachers" && a.className !== teacherFilter) return false; // placeholder: teacher filter
      if (classFilter !== "All Classes" && a.className !== classFilter) return false;
      if (courseFilter !== "All Courses" && a.courseName !== courseFilter) return false;
      if (statusFilter !== "All Status" && a.status !== statusFilter) return false;
      if (fromDate && new Date(a.assignedDate) < new Date(fromDate)) return false;
      if (toDate && new Date(a.assignedDate) > new Date(toDate)) return false;
      if (!q) return true;
      return [a.assignmentId, a.studentName, a.className, a.courseName, a.status].join(" ").toLowerCase().includes(q);
    });
  }, [assignments, search, teacherFilter, classFilter, courseFilter, statusFilter, fromDate, toDate]);

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
                  <option>All Teachers</option>
                </select>
              </div>
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Class</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}>
                  <option>All Classes</option>
                  <option>Blue House</option>
                </select>
              </div>
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Course</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}>
                  <option>All Courses</option>
                  <option>Mathematics</option>
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
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option>All Status</option>
                  <option>Open</option>
                  <option>Completed</option>
                  <option>Overdue</option>
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
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Assignment ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Student</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Course</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Assigned Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Due Date</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.id}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.assignmentId}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.studentName}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.className}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.courseName}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.assignedDate}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.dueDate}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.status}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" startIcon={<PencilIcon className="size-4" />} onClick={() => { sessionStorage.setItem("assignmentEditItem", JSON.stringify(item)); navigate("/assignments/edit", { state: { item } }); }} title="Edit" ariaLabel="Edit" className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200" />
                          <Button size="sm" variant="outline" startIcon={<CloseIcon className="size-4" />} onClick={() => console.log("Close", item.id)} title="Close Assignment" ariaLabel="Close Assignment" className="!px-3 !py-3 !min-w-0 rounded-full !bg-warning-100/20 !text-warning-600 hover:!bg-warning-200" />
                          <Button size="sm" variant="outline" startIcon={<CopyIcon className="size-4" />} onClick={() => console.log("Re-assign", item.id)} title="Re-assignment" ariaLabel="Re-assignment" className="!px-3 !py-3 !min-w-0 rounded-full !bg-info-100/20 !text-info-600 hover:!bg-info-200" />
                          <Button size="sm" variant="outline" startIcon={<TrashBinIcon className="size-4" />} onClick={() => handleDelete(item.id)} title="Delete" ariaLabel="Delete" className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200" />
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
    </>
  );
}
