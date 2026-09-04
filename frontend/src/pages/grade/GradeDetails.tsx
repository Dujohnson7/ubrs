import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { ChevronLeftIcon } from "../../icons";
import { GradeResponseDto } from "../../services/gradeService";

export default function GradeDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const grade = (location.state as { grade?: GradeResponseDto } | null)?.grade;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const details = grade?.gradeDetails ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return details;
    return details.filter(d =>
      [d.gradeDetailsId, d.studentCode, d.studentName, String(d.mark)]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [details, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const markColor = (mark: number, max: number) => {
    const pct = max > 0 ? (mark / max) * 100 : 100;
    if (pct >= 75) return "text-success-600 dark:text-success-400";
    if (pct >= 50) return "text-warning-600 dark:text-warning-400";
    return "text-error-600 dark:text-error-400";
  };

  const printReportFormat = () => {
    if (!grade) return;
    
    const tableRows = filtered.map((d, i) => {
      const pct = grade.maxMark > 0 ? ((d.mark / grade.maxMark) * 100).toFixed(1) + "%" : "—";
      return `
        <tr>
          <td style="padding:6px;border:1px solid #000;text-align:center;">${i + 1}</td>
          <td style="padding:6px;border:1px solid #000;">${d.studentCode}</td>
          <td style="padding:6px;border:1px solid #000;">${d.studentName}</td>
          <td style="padding:6px;border:1px solid #000;text-align:center;font-weight:bold;">${d.mark}</td>
          <td style="padding:6px;border:1px solid #000;text-align:center;">${grade.maxMark}</td>
          <td style="padding:6px;border:1px solid #000;text-align:center;">${pct}</td>
        </tr>
      `;
    }).join("");

    const htmlContent = `
      <div style="font-family:'Times New Roman',Times,serif; max-width:900px; margin:0 auto; background:#fff; border:2px solid #000;">
        <!-- HEADER -->
        <div style="padding:15px;text-align:center;border-bottom:2px solid #000;">
          <div style="font-size:16px;font-weight:900;text-transform:uppercase;">REPUBLIC OF RWANDA</div>
          <div style="font-size:14px;font-weight:700;margin-top:4px;">MINISTRY OF EDUCATION</div>
        </div>
        
        <!-- ACADEMIC INFO -->
        <div style="padding:15px; border-bottom:2px solid #000; background:#fafafa;">
          <div style="text-align:center; font-size:16px; font-weight:bold; text-transform:uppercase; margin-bottom:15px; text-decoration:underline;">
            Subject Marks Report
          </div>
          <table style="width:100%; font-size:13px; line-height:1.5;">
            <tr>
              <td><strong>Course:</strong> ${grade.courseName} (${grade.courseCode})</td>
              <td><strong>Class:</strong> ${grade.schoolClassName}</td>
            </tr>
            <tr>
              <td><strong>Term / Year:</strong> ${grade.term?.replace(/^TERM(\d)$/, "Term $1")} / ${grade.fiscalYear}</td>
              <td><strong>Type / Max Mark:</strong> ${grade.gradeType} / ${grade.maxMark}</td>
            </tr>
          </table>
        </div>

        <!-- TABLE -->
        <div style="padding:15px;">
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#000; color:#fff;">
                <th style="padding:8px;border:1px solid #000;text-align:center;">#</th>
                <th style="padding:8px;border:1px solid #000;text-align:left;">Student Code</th>
                <th style="padding:8px;border:1px solid #000;text-align:left;">Student Name</th>
                <th style="padding:8px;border:1px solid #000;text-align:center;">Mark</th>
                <th style="padding:8px;border:1px solid #000;text-align:center;">Out Of</th>
                <th style="padding:8px;border:1px solid #000;text-align:center;">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>

        <!-- SIGNATURES -->
        <div style="padding:40px 30px; display:flex; justify-content:space-between; font-size:13px;">
          <div style="text-align:center; width:250px;">
            <div style="border-top:1px solid #000; padding-top:5px;"><strong>Course Teacher Signature</strong></div>
          </div>
          <div style="text-align:center; width:250px;">
            <div style="border-top:1px solid #000; padding-top:5px;"><strong>Headteacher Signature</strong></div>
          </div>
        </div>
      </div>
    `;

    const win = window.open("", "_blank", "width=920,height=750");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Marks Report — ${grade.courseName}</title>
      <meta charset="UTF-8"/>
      <style>
        @page{size:A4 portrait;margin:10mm;}
        body{margin:0;padding:10px;background:#fff;font-family:'Times New Roman',Times,serif;}
        @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
      </style>
    </head><body>${htmlContent}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 650);
  };

  if (!grade) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-gray-500">Grade batch not found.</p>
        <Button size="sm" onClick={() => navigate("/grades")}>Back to Grades</Button>
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Ubrs - Grades: ${grade.courseName ?? "Details"}`} description="View student marks for this grade batch." />

      <div className="space-y-6">
        {/* Back */}
        <div>
          <Button size="sm" variant="outline" startIcon={<ChevronLeftIcon className="size-4" />} onClick={() => navigate("/grades")}>
            Back to Grades
          </Button>
        </div>

        <ComponentCard title="Student Grades" titleClassName="text-xl sm:text-2xl">
          {/* Info strip */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900/40 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Course</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{grade.courseName}</p>
              <p className="text-xs text-gray-400">{grade.courseCode}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Class</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{grade.schoolClassName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Term / Year</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{grade.term?.replace(/^TERM(\d)$/, "Term $1")} · {grade.fiscalYear}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Type / Max Mark</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">{grade.gradeType} / {grade.maxMark}</p>
            </div>
            {grade.feedback && (
              <div className="col-span-2 sm:col-span-4">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Feedback</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{grade.feedback}</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Input placeholder="Search by name, code, mark..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Button size="sm" variant="outline" onClick={printReportFormat}>Download PDF</Button>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Student Code</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Student Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mark</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Out of</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">%</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-8 text-center text-gray-400 dark:text-gray-600" colSpan={6}>No student records found.</TableCell>
                    </TableRow>
                  ) : paginated.map((d, idx) => {
                    const pct = grade.maxMark > 0 ? ((d.mark / grade.maxMark) * 100).toFixed(1) : "—";
                    return (
                      <TableRow key={d.gradeDetailsId} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{d.studentCode}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{d.studentName}</TableCell>
                        <TableCell className={`px-5 py-4 text-start text-theme-sm font-semibold ${markColor(d.mark, grade.maxMark)}`}>{d.mark}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{grade.maxMark}</TableCell>
                        <TableCell className={`px-5 py-4 text-start text-theme-sm font-semibold ${markColor(d.mark, grade.maxMark)}`}>{pct}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center mt-2">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
              <select className="h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{currentPage}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Next</Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
