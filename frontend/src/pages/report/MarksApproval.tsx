import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { ClassApproval, ApprovalStatus, sampleApprovalData, STATUS_CFG } from "./approvalData";

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function MarksApproval() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<ClassApproval[]>(sampleApprovalData);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() =>
    data.filter((c) => {
      if (levelFilter !== "All" && !c.classLevel.startsWith(levelFilter)) return false;
      if (search && !c.className.toLowerCase().includes(search.toLowerCase()) && !c.classTeacher.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
  [data, search, levelFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getClassStatus = (cls: ClassApproval): ApprovalStatus => {
    const all = cls.subjects;
    if (all.every((s) => s.status === "approved")) return "approved";
    if (all.some((s) => s.status === "rejected")) return "rejected";
    if (all.some((s) => s.status === "submitted")) return "submitted";
    return "pending";
  };

  // Overall stats
  const allSubjects = data.flatMap((c) => c.subjects);
  const overallStats = {
    classes: data.length,
    approved: allSubjects.filter((s) => s.status === "approved").length,
    submitted: allSubjects.filter((s) => s.status === "submitted").length,
    pending: allSubjects.filter((s) => s.status === "pending").length,
    rejected: allSubjects.filter((s) => s.status === "rejected").length,
  };

  return (
    <>
      <PageMeta title="Ubrs — Marks Approval" description="Class teacher review and approval of subject marks." />
      <PageBreadcrumb pageTitle="Marks Approval" />

      <div className="space-y-6">
        {/* Overall summary pills / cards at the top instead of a big banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Classes",   val: overallStats.classes,   bg: "bg-gray-50 dark:bg-gray-800/50", border: "border-gray-200 dark:border-gray-700", text: "text-gray-800 dark:text-gray-200" },
            { label: "Approved",  val: overallStats.approved,  bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-400" },
            { label: "Submitted", val: overallStats.submitted, bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
            { label: "Pending",   val: overallStats.pending,   bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
            { label: "Rejected",  val: overallStats.rejected,  bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-400" },
          ].map(({ label, val, bg, border, text }) => (
            <div key={label} className={`rounded-xl border ${border} ${bg} p-4 text-center`}>
              <div className={`text-3xl font-black ${text}`}>{val}</div>
              <div className={`text-[10px] uppercase tracking-wider mt-1 font-bold ${text} opacity-80`}>{label}</div>
            </div>
          ))}
        </div>

        <ComponentCard title="Classes Pending Review" titleClassName="text-xl sm:text-2xl">
          {/* Filters */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] mb-5">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Classes</label>
                <Input placeholder="Search by class name or teacher..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Level</label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={levelFilter}
                  onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                >
                  {["All", "Primary", "Nursery"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {["#","Class","Level","Class Teacher","Term","Subjects","Approved","Status","Action"].map((h) => (
                      <TableCell key={h} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-10 text-center text-gray-400" colSpan={9}>No classes found.</TableCell>
                    </TableRow>
                  ) : paginated.map((cls, idx) => {
                    const approved = cls.subjects.filter((s) => s.status === "approved").length;
                    const total    = cls.subjects.length;
                    const pct      = total ? Math.round((approved / total) * 100) : 0;
                    const status   = getClassStatus(cls);
                    return (
                      <TableRow key={cls.classId} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="px-5 py-4 text-gray-400 text-xs">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="size-9 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {cls.className.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 dark:text-gray-100 text-sm">{cls.className}</div>
                              <div className="text-[10px] text-gray-400">{cls.classId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{cls.classLevel}</TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{cls.classTeacher}</TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{cls.term}</TableCell>
                        <TableCell className="px-5 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">{total}</TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                              <div
                                className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">{approved}/{total}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4"><StatusBadge status={status} /></TableCell>
                        <TableCell className="px-5 py-4">
                          <button
                            id={`view-details-${cls.classId}`}
                            onClick={() => navigate(`/marks-approval/${cls.classId}`)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50 whitespace-nowrap"
                          >
                            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="grid gap-4 px-4 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm">{currentPage}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Next</Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
