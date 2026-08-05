import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { printAllClassReports } from "./reportPrintUtils";

const sampleClasses = [
  {
    id: "1",
    classId: "C101",
    name: "Primary 1A",
    classLevel: "Primary 1",
    classTeacher: "Ms. Grace Uwimana",
    studentCount: 32,
    term: "Term 1",
    academicYear: "2025 - 2026",
  },
  {
    id: "2",
    classId: "C102",
    name: "Primary 1B",
    classLevel: "Primary 1",
    classTeacher: "Mr. Jean Bosco",
    studentCount: 28,
    term: "Term 1",
    academicYear: "2025 - 2026",
  },
  {
    id: "3",
    classId: "C201",
    name: "Primary 2A",
    classLevel: "Primary 2",
    classTeacher: "Mrs. Aline Mukamana",
    studentCount: 35,
    term: "Term 1",
    academicYear: "2025 - 2026",
  },
  {
    id: "4",
    classId: "C301",
    name: "Primary 3A",
    classLevel: "Primary 3",
    classTeacher: "Mr. Patrick Nkurunziza",
    studentCount: 30,
    term: "Term 1",
    academicYear: "2025 - 2026",
  },
  {
    id: "5",
    classId: "N101",
    name: "Nursery A",
    classLevel: "Nursery",
    classTeacher: "Ms. Claudette Ingabire",
    studentCount: 20,
    term: "Term 1",
    academicYear: "2025 - 2026",
  },
];

export default function StudentReports() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [termFilter, setTermFilter] = useState("All Terms");
  const [yearFilter, setYearFilter] = useState("All Years");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sampleClasses.filter((c) => {
      if (levelFilter !== "All Levels" && !c.classLevel.startsWith(levelFilter)) return false;
      if (termFilter !== "All Terms" && c.term !== termFilter) return false;
      if (yearFilter !== "All Years" && c.academicYear !== yearFilter) return false;
      if (!q) return true;
      return [c.classId, c.name, c.classLevel, c.classTeacher].join(" ").toLowerCase().includes(q);
    });
  }, [search, levelFilter, termFilter, yearFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageMeta title="Ubrs - Student Reports" description="View and print student report cards by class." /> 

      <div className="space-y-6">
        <ComponentCard title="Student Reports" titleClassName="text-xl sm:text-2xl">
          {/* Filters */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Search Classes
                </label>
                <Input
                  placeholder="Search by class name, teacher..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Level
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={levelFilter}
                  onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                >
                  <option>All Levels</option>
                  <option>Primary</option>
                  <option>Nursery</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Term
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={termFilter}
                  onChange={(e) => { setTermFilter(e.target.value); setPage(1); }}
                >
                  <option>All Terms</option>
                  <option>Term 1</option>
                  <option>Term 2</option>
                  <option>Term 3</option>
                </select>
              </div>

              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Academic Year
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={yearFilter}
                  onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
                >
                  <option>All Years</option>
                  <option>2025 - 2026</option>
                  <option>2024 - 2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class ID</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Level</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class Teacher</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Students</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Term</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-10 text-center text-gray-400 text-theme-sm" colSpan={8}>
                        No classes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((item, idx) => (
                      <TableRow key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                            {item.classId}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 font-semibold text-gray-800 text-start text-theme-sm dark:text-white/90">
                          {item.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.classLevel}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-600 text-start text-theme-sm dark:text-gray-300">
                          {item.classTeacher}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="inline-flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-200">
                            <svg className="size-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {item.studentCount}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.term}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="flex flex-wrap gap-2">
                            {/* View Details */}
                            <button
                              id={`view-class-${item.id}`}
                              onClick={() => navigate(`/student-reports/${item.id}`, { state: { classData: item } })}
                              title="View Students"
                              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50"
                            >
                              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </button>

                            {/* Print All */}
                            <button
                              id={`print-class-${item.id}`}
                              onClick={() => printAllClassReports(item)}
                              title="Print All Reports"
                              className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3.5 py-2 text-xs font-semibold text-success-700 hover:bg-success-100 transition-colors dark:bg-success-900/30 dark:text-success-300 dark:hover:bg-success-900/50"
                            >
                              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              Print All
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
              <select
                className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="justify-self-center">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
                <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm">{currentPage}</span>
                <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Next</Button>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
