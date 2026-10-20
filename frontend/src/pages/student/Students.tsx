import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { studentService, StudentResponseDto, EGender, EStudentState, ParentStudentResponseDto } from "../../services/studentService";
import { schoolClassService } from "../../services/schoolClassService";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { Modal } from "../../components/ui/modal"; 
import { useAuth } from "../../hooks/useAuth";
import { ERole } from "../../services/authService";
import { useRoleAccess } from "../../hooks/useRoleAccess";

function StudentsUploadModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const isClassTeacher = user?.role === ERole.CLASSTEACHER;
  const [file, setFile] = useState<File | null>(null);
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<import("../../services/schoolClassService").SchoolClassResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = (isClassTeacher && user?.userId)
          ? await schoolClassService.getClassesTaughtByTeacher(user.userId)
          : await schoolClassService.getAllSchoolClasses();
        setClasses(data);
      } catch (err) {
        // Error is handled by toast in service
      }
    };

    loadClasses();
  }, [isClassTeacher, user?.userId]);

  const handleUpload = async () => {
    if (!file || !classId) return;

    setLoading(true);

    try {
      await studentService.importStudents(file, classId);
      onSuccess();
      onClose();
      setFile(null);
      setClassId("");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    } 
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-10">
      <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">Upload Students</h3>
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">File (CSV/Excel)</label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-800 dark:file:text-gray-300"
          />
          {file && <p className="mt-1 text-xs text-gray-400">{file.name}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
          <select
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.schoolClassId} value={cls.schoolClassId}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleUpload} disabled={!file || !classId || loading}>{loading ? "Uploading..." : "Upload"}</Button>
      </div>
    </Modal>
  );
}

function StudentParentsModal({ isOpen, onClose, student }: { isOpen: boolean; onClose: () => void; student: StudentResponseDto | null }) {
  const [parents, setParents] = useState<ParentStudentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !student) return;
    setLoading(true);
    studentService.getStudentParents(student.studentId)
      .then(setParents)
      .catch(() => setParents([]))
      .finally(() => setLoading(false));
  }, [isOpen, student]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            Parents / Guardians
          </h3>
          {student && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {student.firstName} {student.middleName} {student.lastName} &mdash; {student.studentCode}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      {loading ? (
        <div className="py-10 text-center text-gray-400 text-sm">Loading parents...</div>
      ) : parents.length === 0 ? (
        <div className="py-10 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center size-12 rounded-full bg-gray-100 dark:bg-gray-800">
            <svg className="size-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <p className="text-sm text-gray-400">No parents/guardians found for this student.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parents.map((p, i) => (
            <div key={p.parentId || i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center size-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-bold text-sm shrink-0">
                  {p.parentName?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white/90 text-sm">{p.parentName || "—"}</p>
                  <div className="mt-2 flex flex-col gap-1">
                    {p.parentPhone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {p.parentPhone}
                      </div>
                    )}
                    {p.parentEmail && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {p.parentEmail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

export default function Students() {
  const { user } = useAuth();
  const { canManageStudents } = useRoleAccess();
  const isClassTeacher = user?.role === ERole.CLASSTEACHER;

  const [students, setStudents] = useState<StudentResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EStudentState>("ALL");
  const [genderFilter, setGenderFilter] = useState<"ALL" | EGender>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [parentsStudent, setParentsStudent] = useState<StudentResponseDto | null>(null);
  const [parentsModalOpen, setParentsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (isClassTeacher && user?.userId) {
        data = await studentService.getStudentsByTeacher(user.userId);
      } else if (classFilter === "PRIMARY") {
        data = await studentService.getPrimaryStudents();
      } else if (classFilter === "NURSERY") {
        data = await studentService.getNurseryStudents();
      } else {
        data = await studentService.getAllStudents();
      }
      setStudents(data);
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  }, [classFilter, isClassTeacher, user?.userId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = (studentId: string) => {
    setStudentToDelete(studentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await studentService.deleteStudent(studentToDelete);
      setStudents((current) => current.filter((item) => item.studentId !== studentToDelete));
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      if (statusFilter !== "ALL" && s.studentStatus !== statusFilter) return false;
      if (genderFilter !== "ALL" && s.gender !== genderFilter) return false;
      if (!q) return true;
      return [s.studentCode, s.firstName, s.middleName, s.lastName, s.schoolClassName].join(" ").toLowerCase().includes(q);
    });
  }, [students, search, statusFilter, genderFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageMeta title="Ubrs - Students" description="Manage students." /> 

      <div className="space-y-6">
        <ComponentCard title="Students" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className={`grid gap-4 ${isClassTeacher ? "lg:grid-cols-[2fr_1fr_1fr_auto]" : "lg:grid-cols-[2fr_1fr_1fr_1fr_auto]"} items-end`}>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Entries</label>
                <Input placeholder="Search students..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              {!isClassTeacher && (
                <div>
                  <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">School Level</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}>
                    <option value="ALL">All Levels</option>
                    <option value="PRIMARY">Primary</option>
                    <option value="NURSERY">Nursery</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Status</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as "ALL" | EStudentState); setPage(1); }}>
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Gender</label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={genderFilter} onChange={(e) => { setGenderFilter(e.target.value as "ALL" | EGender); setPage(1); }}>
                  <option value="ALL">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              {canManageStudents && (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(true)}>Upload</Button>
                  <Link to="/students/create">
                    <Button size="sm">Add Student</Button>
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
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Student Code</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Gender</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.map((item, index) => (
                    <TableRow key={item.studentId}>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.studentCode}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.firstName} {item.middleName} {item.lastName}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.gender}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.studentStatus}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.schoolClassName || "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              startIcon={<svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                              onClick={() => { setParentsStudent(item); setParentsModalOpen(true); }}
                              title="View Parents"
                              ariaLabel="View Parents"
                              className="!px-3 !py-3 !min-w-0 rounded-full !bg-indigo-100/20 !text-indigo-600 hover:!bg-indigo-200"
                            />
                            {canManageStudents && (
                              <>
                                <Button size="sm" variant="outline" startIcon={<PencilIcon className="size-4" />} onClick={() => { sessionStorage.setItem("studentEditItem", JSON.stringify(item)); navigate("/students/edit", { state: { item } }); }} title="Edit" ariaLabel="Edit" className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200" />
                                <Button size="sm" variant="outline" startIcon={<TrashBinIcon className="size-4" />} onClick={() => handleDelete(item.studentId)} title="Delete" ariaLabel="Delete" className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200" />
                              </>
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

      <StudentsUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSuccess={fetchStudents} />

      <StudentParentsModal
        isOpen={parentsModalOpen}
        onClose={() => { setParentsModalOpen(false); setParentsStudent(null); }}
        student={parentsStudent}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
