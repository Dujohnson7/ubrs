import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { userService, UsersResponseDto } from "../../services/userService";
import { toast } from "../../utils/toast";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon } from "../../icons";

const columns = [
  { key: "id", label: "#" },
  { key: "names", label: "Name" },
  { key: "role", label: "Role" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

export default function Users() {
  const [users, setUsers] = useState<UsersResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        // Error is handled by toast in service
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleActivate = async (userId: string) => {
    try {
      await userService.activateUser(userId);
      setUsers((current) =>
        current.map((item) =>
          item.userId === userId ? { ...item, userStatus: true } : item
        )
      );
    } catch (err) {
      // Error is handled by toast in service
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await userService.suspendUser(userId);
      setUsers((current) =>
        current.map((item) =>
          item.userId === userId ? { ...item, userStatus: false } : item
        )
      );
    } catch (err) {
      // Error is handled by toast in service
    }
  };

  const handleDelete = async (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await userService.deleteUser(userToDelete);
      setUsers((current) => current.filter((item) => item.userId !== userToDelete));
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleChangePassword = (userId: string) => {
    setUserToChangePassword(userId);
    setNewPassword("");
    setChangePasswordDialogOpen(true);
  };

  const confirmChangePassword = async () => {
    if (!userToChangePassword || !newPassword.trim()) {
      toast.error("Password is required");
      return;
    }

    try {
      await userService.changePassword(userToChangePassword, newPassword.trim());
      setChangePasswordDialogOpen(false);
      setUserToChangePassword(null);
      setNewPassword("");
    } catch (err) {
      // Error is handled by toast in service
    }
  };

  const cancelChangePassword = () => {
    setChangePasswordDialogOpen(false);
    setUserToChangePassword(null);
    setNewPassword("");
  };

  const filteredUsers = useMemo(() => {
    const lowerQuery = search.toLowerCase();

    return users.filter((user) => {
      if (roleFilter !== "All Roles" && user.role !== roleFilter) return false;

      const matchesStatus = statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.userStatus) ||
        (statusFilter === "INACTIVE" && !user.userStatus);

      if (!lowerQuery) return matchesStatus;
      const matchesSearch = [user.names, user.role, user.email, user.phone]
        .join(" ")
        .toLowerCase()
        .includes(lowerQuery);
      return matchesSearch && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageMeta title="Ubrs - Users" description="Manage application users." /> 

      <div className="space-y-6">
        <ComponentCard title="Users" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto] xl:grid-cols-[2.5fr_1fr_1fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Search Entries
                </label>
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Role
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>All Roles</option>
                  <option>HEADERTEACHER</option>
                  <option>CLASSTEACHER</option>
                  <option>TEACHER</option>
                  <option>PARENT</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Status
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-left text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE");
                    setPage(1);
                  }}
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

                <div className="flex justify-end">
                <Link to="/users/create">
                  <Button size="sm">Add User</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Loading users...
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No users found
              </div>
            ) : (
              <>
                <div className="max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {paginatedUsers.map((user, index) => (
                        <TableRow key={user.userId}>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {(currentPage - 1) * pageSize + index + 1}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {user.names}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {user.role}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {user.phone}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {user.email}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              user.userStatus ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {user.userStatus ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                              <div className="flex flex-wrap gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleActivate(user.userId)}
                                disabled={user.userStatus || loading}
                                title="Activate"
                                ariaLabel="Activate"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-green-100/20 !text-green-600 hover:!bg-green-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuspend(user.userId)}
                                disabled={!user.userStatus || loading}
                                title="Suspend"
                                ariaLabel="Suspend"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-red-100/20 !text-red-600 hover:!bg-red-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleChangePassword(user.userId)}
                                title="Change Password"
                                ariaLabel="Change Password"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-blue-100/20 !text-blue-600 hover:!bg-blue-200"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={<PencilIcon className="size-4" />}
                                onClick={() => {
                                  sessionStorage.setItem("usersEditUser", JSON.stringify(user));
                                  navigate("/users/edit", { state: { user } });
                                }}
                                title="Edit"
                                ariaLabel="Edit"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={<TrashBinIcon className="size-4" />}
                                onClick={() => handleDelete(user.userId)}
                                title="Delete"
                                ariaLabel="Delete"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}
                    </span>
                    <select
                      className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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

                  <div className="justify-self-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        {currentPage}
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
              </>
            )}
          </div>
        </ComponentCard>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={changePasswordDialogOpen}
        title="Change Password"
        message={
          <div className="space-y-4">
            <p>Enter the new password for this user:</p>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoFocus
            />
          </div>
        }
        onConfirm={confirmChangePassword}
        onCancel={cancelChangePassword}
        confirmText="Change Password"
        cancelText="Cancel"
      />
    </>
  );
}
