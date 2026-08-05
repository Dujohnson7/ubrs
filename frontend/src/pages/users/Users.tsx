import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { userService, User } from "../../services/userService";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import { PencilIcon, TrashBinIcon, CheckLineIcon, CloseLineIcon } from "../../icons";

const columns = [
  { key: "id", label: "#" },
  { key: "userName", label: "User Name" },
  { key: "role", label: "Role" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" },
  { key: "actions", label: "Actions" },
];

const sampleUsers: User[] = [
  {
    id: "1",
    userName: "Alice Uwimana",
    role: "Header Teacher",
    phone: "+250788111222",
    email: "alice.uwimana@school.com",
    password: "Pass@123",
    status: "Active",
    isFirstTime: false,
    createdAt: "2026-07-22T08:00:00.000Z",
  },
  {
    id: "2",
    userName: "Brian Mukamana",
    role: "Class Teacher",
    phone: "+250788333444",
    email: "brian.mukamana@school.com",
    password: "Teach2026",
    status: "Inactive",
    isFirstTime: true,
    createdAt: "2026-07-20T11:30:00.000Z",
  },
  {
    id: "3",
    userName: "Clara Nyirahabimana",
    role: "Teacher",
    phone: "+250782555666",
    email: "clara.nyirahabimana@school.com",
    password: "School@2026",
    status: "Active",
    isFirstTime: false,
    createdAt: "2026-07-18T14:45:00.000Z",
  },
  {
    id: "4",
    userName: "David Nshimiyimana",
    role: "Parent",
    phone: "+250788777888",
    email: "david.nshimiyimana@example.com",
    password: "ParentPass#1",
    status: "Inactive",
    isFirstTime: false,
    createdAt: "2026-07-19T09:20:00.000Z",
  },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    userService
      .getUsers()
      .then((data) => {
        if (mounted) {
          setUsers(data.length ? data : sampleUsers);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || "Unable to load users.");
          setUsers(sampleUsers);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const lowerQuery = search.toLowerCase();

    return users.filter((user) => {
      const created = new Date(user.createdAt);
      if (fromDate && created < new Date(fromDate)) return false;
      if (toDate && created > new Date(toDate)) return false;

      if (roleFilter !== "All Roles" && user.role !== roleFilter) return false;

      if (!lowerQuery) return true;
      return [user.userName, user.role, user.email, user.phone, user.status]
        .join(" ")
        .toLowerCase()
        .includes(lowerQuery);
    });
  }, [users, search, fromDate, toDate, roleFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDelete = (id: string) => {
    setUsers((current) => current.filter((user) => user.id !== id));
  };

  const toggleStatus = (id: string) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
  };

  return (
    <>
      <PageMeta title="Ubrs - Users" description="Manage application users." /> 

      <div className="space-y-6">
        <ComponentCard title="Users" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] xl:grid-cols-[2.5fr_1fr_1fr_1fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Search Entries
                </label>
                <Input
                  placeholder="Search by user name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div>
                <DatePicker
                  id="fromDate"
                  label="From Date"
                  placeholder="Select start date"
                  defaultDate={fromDate || undefined}
                  onChange={(selectedDates) => {
                    setFromDate(selectedDates.length ? selectedDates[0].toISOString().split("T")[0] : "");
                    setPage(1);
                  }}
                />
              </div>

              <div>
                <DatePicker
                  id="toDate"
                  label="To Date"
                  placeholder="Select end date"
                  defaultDate={toDate || undefined}
                  onChange={(selectedDates) => {
                    setToDate(selectedDates.length ? selectedDates[0].toISOString().split("T")[0] : "");
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
                  <option>Header Teacher</option>
                  <option>Class Teacher</option>
                  <option>Teacher</option>
                  <option>Parent</option>
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
            ) : error ? (
              <div className="p-8 text-center text-red-500 dark:text-red-400">
                {error}
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
                      {paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {user.id}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {user.userName}
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
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${user.status === "Active" ? "bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400" : "bg-error-100 text-error-700 dark:bg-error-500/15 dark:text-error-400"}`}>
                              {user.status ?? (user.isFirstTime ? "First Time" : "Returning")}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                              <div className="flex flex-wrap gap-2">
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
                                onClick={() => handleDelete(user.id)}
                                title="Delete"
                                ariaLabel="Delete"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={user.status === "Active" ? <CloseLineIcon className="size-4" /> : <CheckLineIcon className="size-4" />}
                                onClick={() => toggleStatus(user.id)}
                                title={user.status === "Active" ? "Deactivate" : "Activate"}
                                ariaLabel={user.status === "Active" ? "Deactivate" : "Activate"}
                                className={`!px-3 !py-3 !min-w-0 rounded-full ${user.status === "Active" ? "!bg-warning-100/20 !text-warning-600 hover:!bg-warning-200" : "!bg-success-100/20 !text-success-600 hover:!bg-success-200"}`}
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
    </>
  );
}
