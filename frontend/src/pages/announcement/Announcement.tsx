import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon } from "../../icons";
import {
  announcementService,
  AnnouncementResponseDto,
  EReminderState,
  ANNOUNCEMENT_UPDATED_EVENT,
} from "../../services/announcementService";
import { useRoleAccess } from "../../hooks/useRoleAccess";

function formatDateTime(isoString?: string): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export type AnnouncementStatusType = "ACTIVE" | "SCHEDULED" | "EXPIRED";

export function getAnnouncementStatus(activeTime?: string, expireTime?: string): AnnouncementStatusType {
  const now = new Date().getTime();
  const start = activeTime ? new Date(activeTime).getTime() : 0;
  const end = expireTime ? new Date(expireTime).getTime() : Infinity;

  if (start && now < start) return "SCHEDULED";
  if (end && now > end) return "EXPIRED";
  return "ACTIVE";
}

export default function Announcements() {
  const { canManageAnnouncements } = useRoleAccess();
  const [announcements, setAnnouncements] = useState<AnnouncementResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<EReminderState | "ALL_TARGETS">("ALL_TARGETS");
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatusType | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<AnnouncementResponseDto | null>(null);
  const navigate = useNavigate();

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAllAnnouncements();
      // Sort newest first by activeTime or id
      const sorted = [...(data || [])].sort((a, b) => {
        const timeA = a.activeTime ? new Date(a.activeTime).getTime() : 0;
        const timeB = b.activeTime ? new Date(b.activeTime).getTime() : 0;
        return timeB - timeA;
      });
      setAnnouncements(sorted);
    } catch {
      // Handled in service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();

    const handleUpdate = () => {
      loadAnnouncements();
    };
    window.addEventListener(ANNOUNCEMENT_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(ANNOUNCEMENT_UPDATED_EVENT, handleUpdate);
  }, []);

  const handleDelete = (id: string) => {
    setAnnouncementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;
    try {
      await announcementService.deleteAnnouncement(announcementToDelete);
      setAnnouncements((current) => current.filter((item) => item.announcementId !== announcementToDelete));
    } catch {
      // Handled in service
    } finally {
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setAnnouncementToDelete(null);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return announcements.filter((item) => {
      const status = getAnnouncementStatus(item.activeTime, item.expireTime);
      const matchesSearch = q
        ? item.message?.toLowerCase().includes(q) || item.reminderState?.toLowerCase().includes(q)
        : true;
      const matchesAudience = audienceFilter === "ALL_TARGETS" || item.reminderState === audienceFilter;
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      return matchesSearch && matchesAudience && matchesStatus;
    });
  }, [announcements, search, audienceFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);


  return (
    <>
      <PageMeta title="Ubrs — Announcements Management" description="Manage school announcements." />

      <div className="space-y-6">

        <ComponentCard title="Announcements" titleClassName="text-xl sm:text-2xl">
          {/* Filters & Action */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Search Message
                </label>
                <Input
                  placeholder="Search message text..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Target Audience
                </label>
                <select
                  className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 w-full"
                  value={audienceFilter}
                  onChange={(e) => {
                    setAudienceFilter(e.target.value as EReminderState | "ALL_TARGETS");
                    setPage(1);
                  }}
                  disabled={loading}
                >
                  <option value="ALL_TARGETS">All Audiences</option>
                  <option value="ALL">Everyone (ALL)</option>
                  <option value="STAFF">Staff Only</option>
                  <option value="PARENT">Parents Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Status
                </label>
                <select
                  className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 w-full"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as AnnouncementStatusType | "ALL");
                    setPage(1);
                  }}
                  disabled={loading}
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>

              {canManageAnnouncements && (
                <div className="flex justify-end">
                  <Link to="/announcements/create">
                    <Button size="sm">New Announcements</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading announcements...</div>
            ) : paginated.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No announcements found</div>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        #
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Message
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Audience
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Active Time
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Expire Time
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Status
                      </TableCell>
                      {canManageAnnouncements && (
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                          Actions
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginated.map((item, index) => {
                      const status = getAnnouncementStatus(item.activeTime, item.expireTime);
                      return (
                        <TableRow key={item.announcementId} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {(currentPage - 1) * pageSize + index + 1}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white max-w-md">
                            <div className="flex flex-col">
                              <span className="font-semibold line-clamp-2 cursor-pointer hover:text-brand-600" onClick={() => setViewingAnnouncement(item)} title="Click to view full message">
                                {item.message}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start text-theme-sm">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.reminderState === "ALL"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                  : item.reminderState === "STAFF"
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                }`}
                            >
                              {item.reminderState}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                            {formatDateTime(item.activeTime)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                            {formatDateTime(item.expireTime)}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-start text-theme-sm">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status === "ACTIVE"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : status === "SCHEDULED"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${status === "ACTIVE" ? "bg-green-500 animate-pulse" : status === "SCHEDULED" ? "bg-blue-500" : "bg-gray-400"
                                  }`}
                              />
                              {status}
                            </span>
                          </TableCell>
                          {canManageAnnouncements && (
                            <TableCell className="px-5 py-4 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                              <div className="flex flex-wrap gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  startIcon={<PencilIcon className="size-4" />}
                                  onClick={() => navigate("/announcements/edit", { state: { item } })}
                                  title="Edit"
                                  ariaLabel="Edit"
                                  className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  startIcon={<TrashBinIcon className="size-4" />}
                                  onClick={() => handleDelete(item.announcementId)}
                                  title="Delete"
                                  ariaLabel="Delete"
                                  className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200"
                                />
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Showing {paginated.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
                </span>
                <select
                  className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  disabled={loading}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="justify-self-center text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1 || loading}>
                    Previous
                  </Button>
                  <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    {currentPage}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount || loading}>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* View Message Modal */}
      <Modal
        isOpen={!!viewingAnnouncement}
        onClose={() => setViewingAnnouncement(null)}
        className="w-[calc(100vw-2rem)] sm:w-full max-w-lg p-5 sm:p-6 mx-auto"
      >
        {viewingAnnouncement && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 pr-10 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                Announcement Details
              </h3>
              <span
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                  viewingAnnouncement.reminderState === "ALL"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : viewingAnnouncement.reminderState === "STAFF"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                }`}
              >
                Audience: {viewingAnnouncement.reminderState}
              </span>
            </div>
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-sm sm:text-base max-h-[50vh] sm:max-h-[55vh] overflow-y-auto break-words [overflow-wrap:anywhere] overscroll-contain select-text">
              {viewingAnnouncement.message}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 p-3 rounded-xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Active From:</span>
                <span>{formatDateTime(viewingAnnouncement.activeTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Expires At:</span>
                <span>{formatDateTime(viewingAnnouncement.expireTime)}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button size="sm" variant="outline" onClick={() => setViewingAnnouncement(null)} className="w-full sm:w-auto">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
