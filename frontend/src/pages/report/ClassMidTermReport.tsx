import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { ChevronLeftIcon } from "../../icons";
import { midTermReportService, MidTermReportProjection } from "../../services/midTermReportService";
import { loadReportSignatories, ReportSignatories } from "./reportSignatures";
import { toast } from "../../utils/toast";


interface NavState {
  classId?: string;
  className?: string;
  classLevel?: string;
  classTeacher?: string;
  classTeacherId?: string;
  academicYearId?: string;
  academicYear?: string;
  term?: string;
  studentCount?: number;
}

interface CourseColumn {
  courseId: string;
  courseCode: string;
  courseName: string;
  maxMark: number | null;
}

interface StudentPivotRow {
  studentId: string;
  studentCode: string;
  studentName: string;
  marks: Record<string, number | null>;
  totalMark: number;
  totalMax: number;
  percentage: number | null;
  position: number;
  positionLabel: string;
}


const formatTerm = (t?: string) => (t || "").replace(/^TERM(\d)$/i, "Term $1") || "—";

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const gradeFromPct = (pct: number | null): { grade: string; remarks: string } => {
  if (pct == null) return { grade: "—", remarks: "—" };
  if (pct >= 80) return { grade: "A", remarks: "Excellent" };
  if (pct >= 70) return { grade: "B", remarks: "Very Good" };
  if (pct >= 60) return { grade: "C", remarks: "Good" };
  if (pct >= 50) return { grade: "D", remarks: "Satisfactory" };
  return { grade: "F", remarks: "Needs Improvement" };
};

const markBadgeClass = (mark: number | null, max: number | null) => {
  if (mark == null) return "text-gray-400";
  if (!max || max <= 0) return "text-gray-700 dark:text-gray-200 font-semibold";
  const pct = (mark / max) * 100;
  if (pct >= 75) return "text-success-600 dark:text-success-400 font-bold";
  if (pct >= 50) return "text-warning-600 dark:text-warning-400 font-semibold";
  return "text-error-600 dark:text-error-400 font-semibold";
};

const positionBadgeClass = (pos: number) => {
  if (pos === 1) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300";
  if (pos === 2) return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300";
  if (pos === 3) return "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200";
  return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
};

// ─── Individual Student Report Card HTML Builder ──────────────────────────────

function buildIndividualReportCardHTML(
  student: StudentPivotRow,
  classInfo: NavState,
  courses: CourseColumn[],
  totalStudents: number,
  signatories: ReportSignatories | null
): string {
  const logoSrc = typeof window !== "undefined" ? `${window.location.origin}/images/logo/logo.png` : "/images/logo/logo.png";
  const termLabel = formatTerm(classInfo.term);
  const yearLabel = classInfo.academicYear || "—";
  const teacherName = signatories?.classTeacher || classInfo.classTeacher || "Class Teacher";
  const teacherSig = signatories?.classTeacherSignature || "";
  const headName = signatories?.headteacher || "Head Teacher";
  const headSig = signatories?.headteacherSignature || "";

  const courseRowsHtml = courses
    .map((c, i) => {
      const mark = student.marks[c.courseId];
      const max = c.maxMark ?? 0;
      const pct = mark != null && max > 0 ? (mark / max) * 100 : null;
      const { grade, remarks } = gradeFromPct(pct);

      return `
        <tr>
          <td style="padding:6px 8px;border:1px solid #000;text-align:center;">${i + 1}</td>
          <td style="padding:6px 8px;border:1px solid #000;font-weight:600;">${c.courseName} <span style="font-size:10px;color:#555;">(${c.courseCode})</span></td>
          <td style="padding:6px 8px;border:1px solid #000;text-align:center;font-weight:bold;">${mark != null ? mark : "—"}</td>
          <td style="padding:6px 8px;border:1px solid #000;text-align:center;">${max > 0 ? max : "—"}</td>
          <td style="padding:6px 8px;border:1px solid #000;text-align:center;">${pct != null ? `${pct.toFixed(1)}%` : "—"}</td>
          <td style="padding:6px 8px;border:1px solid #000;text-align:center;font-weight:bold;">${grade}</td>
          <td style="padding:6px 8px;border:1px solid #000;text-align:left;font-size:11px;">${remarks}</td>
        </tr>`;
    })
    .join("");

  const overall = gradeFromPct(student.percentage);

  return `
    <div style="font-family:'Times New Roman',Times,serif;max-width:850px;margin:0 auto;background:#fff;border:2px solid #000;box-sizing:border-box;color:#000;">
      <!-- HEADER -->
      <div style="padding:14px 20px;border-bottom:2px solid #000;display:flex;align-items:center;justify-content:space-between;gap:16px;">
        <img src="${logoSrc}" alt="Logo" style="width:72px;height:72px;object-fit:contain;border:1px solid #000;padding:4px;background:#fff;" />
        <div style="text-align:center;flex:1;">
          <div style="font-size:15px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;">REPUBLIC OF RWANDA</div>
          <div style="font-size:14px;font-weight:900;margin-top:2px;">MINISTRY OF EDUCATION</div>
          <div style="font-size:15px;font-weight:700;margin-top:3px;text-transform:uppercase;letter-spacing:0.5px;color:#1e3e6e;">UMWANA BRIGHT ACADEMY</div>
          <div style="font-size:11px;color:#444;margin-top:2px;"> NYAMAGABE, Rwanda | wrrnouba@gmail.com | +250781107910</div>
        </div>
        <div style="width:72px;"></div>
      </div>

      <!-- TITLE & STUDENT INFO -->
      <div style="padding:12px 18px;border-bottom:2px solid #000;background:#fafafa;">
        <div style="text-align:center;font-size:15px;font-weight:bold;text-transform:uppercase;margin-bottom:10px;text-decoration:underline;letter-spacing:0.5px;">
          Student Mid-Term Assessment Report Card
        </div>
        <table style="width:100%;font-size:12px;line-height:1.6;border-collapse:collapse;">
          <tr>
            <td style="width:50%;"><strong>Student Name:</strong> ${student.studentName}</td>
            <td style="width:50%;"><strong>Registration No / Code:</strong> ${student.studentCode}</td>
          </tr>
          <tr>
            <td><strong>Class:</strong> ${classInfo.className || "—"} ${classInfo.classLevel ? `(${classInfo.classLevel})` : ""}</td>
            <td><strong>Term / Academic Year:</strong> ${termLabel} / ${yearLabel}</td>
          </tr>
          <tr>
            <td><strong>Class Teacher:</strong> ${teacherName}</td> 
          </tr>
        </table>
      </div>

      <!-- MARKS TABLE -->
      <div style="padding:12px 18px;">
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#000;color:#fff;">
              <th style="padding:6px;border:1px solid #000;text-align:center;width:32px;">#</th>
              <th style="padding:6px 8px;border:1px solid #000;text-align:left;">Course</th>
              <th style="padding:6px;border:1px solid #000;text-align:center;width:90px;">Mark Obtained</th>
              <th style="padding:6px;border:1px solid #000;text-align:center;width:80px;">Max Mark</th>
              <th style="padding:6px;border:1px solid #000;text-align:center;width:75px;">Percentage</th>
              <th style="padding:6px;border:1px solid #000;text-align:center;width:55px;">Grade</th>
              <th style="padding:6px 8px;border:1px solid #000;text-align:left;width:120px;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${courseRowsHtml}
            <!-- TOTAL & AVERAGE ROW -->
            <tr style="background:#f3f4f6;font-weight:bold;">
              <td colspan="2" style="padding:8px;border:1px solid #000;text-align:right;">TOTAL SCORE:</td>
              <td style="padding:8px;border:1px solid #000;text-align:center;font-size:13px;">${student.totalMark.toFixed(1)}</td>
              <td style="padding:8px;border:1px solid #000;text-align:center;font-size:13px;">${student.totalMax}</td>
              <td style="padding:8px;border:1px solid #000;text-align:center;font-size:13px;">${student.percentage != null ? `${student.percentage.toFixed(1)}%` : "—"}</td>
              <td style="padding:8px;border:1px solid #000;text-align:center;font-size:13px;">${overall.grade}</td>
              <td style="padding:8px 8px;border:1px solid #000;text-align:left;font-size:11px;">${overall.remarks}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PERFORMANCE SUMMARY BOX -->
      <div style="margin:0 18px 12px;padding:8px 12px;border:1px solid #000;background:#fafafa;font-size:11px;display:flex;justify-content:space-between;align-items:center;">
        <div><strong>Overall Percentage:</strong> ${student.percentage != null ? `${student.percentage.toFixed(1)}%` : "—"}</div>
        <div><strong>Overall Grade:</strong> ${overall.grade} (${overall.remarks})</div>
        <div><strong>Class Rank:</strong> ${student.positionLabel} / ${totalStudents}</div>
      </div>

      <!-- COMMENTS SECTION -->
      <div style="margin:0 18px 14px;border:1px solid #000;padding:8px 12px;font-size:11px;">
        <div style="font-weight:bold;margin-bottom:4px;">Class Teacher's Remark:</div>
        <div style="min-height:22px;border-bottom:1px dotted #888;">${student.percentage != null && student.percentage >= 70
      ? "Very commendable performance! Keep maintaining this standard."
      : student.percentage != null && student.percentage >= 50
        ? "Fair progress shown. More effort needed in challenging courses."
        : "Performance below average. Strong improvement and revision required."
    }</div>
      </div>

      <!-- SIGNATURES -->
      <div style="padding:16px 30px;border-top:2px solid #000;display:flex;justify-content:space-between;font-size:11px;">
        <div style="text-align:center;min-width:170px;">
          <div style="font-size:12px;font-weight:bold;">${teacherName}</div> 
          <div style="min-height:40px;display:flex;align-items:center;justify-content:center;margin:4px 0;">
            ${teacherSig
      ? `<img src="${teacherSig}" alt="Signature" style="max-height:38px;max-width:140px;object-fit:contain;"/>`
      : `<div style="height:25px;"></div>`
    }
          </div>
          <div style="border-top:1px solid #000;padding-top:3px;"><strong>Class Teacher Signature</strong></div>
        </div>

        <div style="text-align:center;min-width:170px;">
          <div style="font-size:12px;font-weight:bold;">${headName}</div> 
          <div style="min-height:40px;display:flex;align-items:center;justify-content:center;margin:4px 0;">
            ${headSig
      ? `<img src="${headSig}" alt="Signature" style="max-height:38px;max-width:140px;object-fit:contain;"/>`
      : `<div style="height:25px;"></div>`
    }
          </div>
          <div style="border-top:1px solid #000;padding-top:3px;"><strong>Head Teacher Signature</strong></div>
        </div> 
      </div>
    </div>
  `;
}

// ─── Individual Student Print Window ──────────────────────────────────────────

function printIndividualReport(
  student: StudentPivotRow,
  classInfo: NavState,
  courses: CourseColumn[],
  totalStudents: number,
  signatories: ReportSignatories | null
) {
  const htmlContent = buildIndividualReportCardHTML(student, classInfo, courses, totalStudents, signatories);

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title> </title>
        <meta charset="UTF-8"/>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body {
            margin: 0;
            padding: 10px;
            background: #fff;
            font-family: 'Times New Roman', Times, serif;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  const win = window.open("", "_blank", "width=900,height=750");
  if (win) {
    win.document.write(fullHtml);
    win.document.close();
    setTimeout(() => {
      win.print();
    }, 650);
  }
}

// ─── Class Summary Pivot Print Window ─────────────────────────────────────────

function printPivotReport(
  classInfo: NavState,
  courses: CourseColumn[],
  students: StudentPivotRow[],
  signatories: ReportSignatories | null
) {
  const logoSrc = typeof window !== "undefined" ? `${window.location.origin}/images/logo/logo.png` : "/images/logo/logo.png";
  const termLabel = formatTerm(classInfo.term);
  const yearLabel = classInfo.academicYear || "—";
  const totalPossibleMax = courses.reduce((acc, c) => acc + (c.maxMark ?? 0), 0);

  const courseHeadersHtml = courses
    .map(
      (c) =>
        `<th style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px;">
          ${c.courseName}<br/><span style="font-weight:normal;font-size:10px;">(/${c.maxMark ?? "—"})</span>
        </th>`
    )
    .join("");

  const tableRowsHtml = students
    .map((s, idx) => {
      const courseCells = courses
        .map((c) => {
          const m = s.marks[c.courseId];
          return `<td style="padding:5px 4px;border:1px solid #000;text-align:center;font-size:11px;font-weight:bold;">
            ${m != null ? m : "—"}
          </td>`;
        })
        .join("");

      const pctStr = s.percentage != null ? `${s.percentage.toFixed(1)}%` : "—";

      return `
        <tr>
          <td style="padding:5px 4px;border:1px solid #000;text-align:center;font-size:11px;">${idx + 1}</td>
          <td style="padding:5px 4px;border:1px solid #000;text-align:center;font-size:11px;font-weight:bold;">${s.positionLabel}</td>
          <td style="padding:5px 6px;border:1px solid #000;font-size:11px;white-space:nowrap;">${s.studentCode}</td>
          <td style="padding:5px 8px;border:1px solid #000;font-size:11px;white-space:nowrap;font-weight:bold;">${s.studentName}</td>
          ${courseCells}
          <td style="padding:5px 4px;border:1px solid #000;text-align:center;font-size:11px;font-weight:bold;">
            ${s.totalMark.toFixed(1)}
          </td>
          <td style="padding:5px 4px;border:1px solid #000;text-align:center;font-size:11px;font-weight:bold;">
            ${pctStr}
          </td>
        </tr>`;
    })
    .join("");

  const teacherName = signatories?.classTeacher || classInfo.classTeacher || "Class Teacher";
  const teacherSig = signatories?.classTeacherSignature || "";
  const headName = signatories?.headteacher || "Head Teacher";
  const headSig = signatories?.headteacherSignature || "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title> </title>
        <meta charset="UTF-8"/>
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          body {
            margin: 0;
            padding: 10px;
            background: #fff;
            font-family: 'Times New Roman', Times, serif;
            color: #000;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div style="max-width:100%; margin:0 auto; background:#fff; border:2px solid #000;">
          <div style="padding:14px 20px; border-bottom:2px solid #000; display:flex; align-items:center; justify-content:space-between; gap:20px;">
            <img src="${logoSrc}" alt="Logo" style="width:70px; height:70px; object-fit:contain; border:1px solid #000; padding:4px; background:#fff;" />
            <div style="text-align:center; flex:1;">
              <div style="font-size:16px; font-weight:900; letter-spacing:0.5px; text-transform:uppercase;">REPUBLIC OF RWANDA</div>
              <div style="font-size:15px; font-weight:900; margin-top:2px;">MINISTRY OF EDUCATION</div>
              <div style="font-size:15px; font-weight:700; margin-top:3px; text-transform:uppercase; letter-spacing:0.5px; color:#1e3e6e;">UMWANA BRIGHT ACADEMY</div>
            </div>
            <div style="width:70px;"></div>
          </div>

          <div style="padding:12px 16px; border-bottom:2px solid #000; background:#fafafa;">
            <div style="text-align:center; font-size:15px; font-weight:bold; text-transform:uppercase; margin-bottom:10px; text-decoration:underline;">
              Class Mid-Term Report
            </div>
            <table style="width:100%; font-size:12px; line-height:1.6;">
              <tr>
                <td style="width:50%;"><strong>Class:</strong> ${classInfo.className || "—"} ${classInfo.classLevel ? `(${classInfo.classLevel})` : ""}</td>
                <td style="width:50%;"><strong>Term / Year:</strong> ${termLabel} / ${yearLabel}</td>
              </tr>
              <tr>
                <td><strong>Class Teacher:</strong> ${teacherName}</td>
                <td><strong>Students:</strong> ${students.length} &nbsp;|&nbsp; <strong>Courses Evaluated:</strong> ${courses.length} (Max: ${totalPossibleMax})</td>
              </tr>
            </table>
          </div>

          <div style="padding:12px;">
            <table style="width:100%; border-collapse:collapse; font-size:11px;">
              <thead>
                <tr style="background:#000; color:#fff;">
                  <th style="padding:6px 4px;border:1px solid #000;text-align:center;width:30px;">#</th>
                  <th style="padding:6px 4px;border:1px solid #000;text-align:center;width:55px;">Rank</th>
                  <th style="padding:6px 6px;border:1px solid #000;text-align:left;white-space:nowrap;">Reg No</th>
                  <th style="padding:6px 8px;border:1px solid #000;text-align:left;white-space:nowrap;">Student Name</th>
                  ${courseHeadersHtml}
                  <th style="padding:6px 4px;border:1px solid #000;text-align:center;white-space:nowrap;">Total<br/><span style="font-weight:normal;font-size:10px;">(/${totalPossibleMax})</span></th>
                  <th style="padding:6px 4px;border:1px solid #000;text-align:center;width:48px;">%</th>
                </tr>
              </thead>
              <tbody>
                ${tableRowsHtml}
              </tbody>
            </table>
          </div>

          <div style="padding:24px 40px; display:flex; justify-content:space-between; font-size:12px; margin-top:10px;">
            <div style="text-align:center; min-width:200px; max-width:260px;">
              <div style="font-size:13px; font-weight:bold; color:#000;">${teacherName}</div> 
              <div style="min-height:46px; display:flex; align-items:center; justify-content:center; margin:6px 0;">
                ${teacherSig
      ? `<img src="${teacherSig}" alt="Signature" style="max-height:44px; max-width:180px; object-fit:contain;" />`
      : `<div style="height:32px;"></div>`
    }
              </div>
              <div style="border-top:1px solid #000; padding-top:4px;"><strong>Class Teacher Signature</strong></div>
            </div>

            <div style="text-align:center; min-width:200px; max-width:260px;">
              <div style="font-size:13px; font-weight:bold; color:#000;">${headName}</div> 
              <div style="min-height:46px; display:flex; align-items:center; justify-content:center; margin:6px 0;">
                ${headSig
      ? `<img src="${headSig}" alt="Signature" style="max-height:44px; max-width:180px; object-fit:contain;" />`
      : `<div style="height:32px;"></div>`
    }
              </div>
              <div style="border-top:1px solid #000; padding-top:4px;"><strong>Head Teacher Signature</strong></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const win = window.open("", "_blank", "width=1250,height=850");
  if (win) {
    win.document.write(htmlContent);
    win.document.close();
    setTimeout(() => {
      win.print();
    }, 650);
  }
}

// ─── Individual Student Report Modal ──────────────────────────────────────────

interface StudentReportModalProps {
  student: StudentPivotRow | null;
  classInfo: NavState;
  courses: CourseColumn[];
  totalStudents: number;
  signatories: ReportSignatories | null;
  onClose: () => void;
  onPrint: (s: StudentPivotRow) => void;
}

function StudentReportModal({
  student,
  classInfo,
  courses,
  totalStudents,
  signatories,
  onClose,
  onPrint,
}: StudentReportModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!student) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [student, onClose]);

  if (!student) return null;

  const html = buildIndividualReportCardHTML(student, classInfo, courses, totalStudents, signatories);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-gray-200 shadow-2xl p-4 rounded-xl">
        <div className="flex items-center justify-between pb-3 px-2">
          <div className="text-sm font-bold text-gray-800">
            Mid-Term Marksheet — {student.studentName} ({student.positionLabel} of {totalStudents})
          </div>
          <div className="flex items-center gap-2">
            <button
              id="modal-print-student-btn"
              onClick={() => onPrint(student)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Print Report
            </button>
            <button
              onClick={onClose}
              className="size-7 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>
        <div
          className="bg-white shadow-inner overflow-auto rounded-lg"
          style={{ maxHeight: "calc(100vh - 120px)" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClassMidTermReport() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state as NavState) || {};
  const academicYearId = state.academicYearId || "";
  const classId = state.classId || "";
  const term = state.term || "TERM1";

  const [rawData, setRawData] = useState<MidTermReportProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [signatories, setSignatories] = useState<ReportSignatories | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentPivotRow | null>(null);

  // Fetch report via getMidTermReportByTerm using academicYearId, schoolClassId, term from state
  useEffect(() => {
    const load = async () => {
      if (!classId || !academicYearId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [data, sigs] = await Promise.all([
          midTermReportService.getMidTermReportByTerm(academicYearId, classId, term),
          loadReportSignatories(classId, state.classTeacher || ""),
        ]);
        setRawData(data);
        setSignatories(sigs);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load mid-term marks for this class.");
        setRawData([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [classId, academicYearId, term, state.classTeacher]);

  // Extract distinct course columns from the response only
  const courses: CourseColumn[] = useMemo(() => {
    const map = new Map<string, CourseColumn>();
    for (const r of rawData) {
      if (!map.has(r.courseId)) {
        map.set(r.courseId, {
          courseId: r.courseId,
          courseCode: r.courseCode,
          courseName: r.courseName,
          maxMark: r.midTermMaxMark,
        });
      } else if (map.get(r.courseId)!.maxMark == null && r.midTermMaxMark != null) {
        map.get(r.courseId)!.maxMark = r.midTermMaxMark;
      }
    }
    return Array.from(map.values()).sort((a, b) => a.courseName.localeCompare(b.courseName));
  }, [rawData]);

  // Group each student into a row with courses as columns and sort by position (highest score first)
  const studentRows: StudentPivotRow[] = useMemo(() => {
    const map = new Map<
      string,
      {
        studentId: string;
        studentCode: string;
        studentName: string;
        marks: Record<string, number | null>;
      }
    >();

    for (const r of rawData) {
      if (!map.has(r.studentId)) {
        map.set(r.studentId, {
          studentId: r.studentId,
          studentCode: r.studentCode || "—",
          studentName: r.studentName || "—",
          marks: {},
        });
      }
      map.get(r.studentId)!.marks[r.courseId] = r.midTermMark;
    }

    const rows = Array.from(map.values()).map((s) => {
      let totalMark = 0;
      let totalMax = 0;
      for (const c of courses) {
        const m = s.marks[c.courseId];
        if (m != null) {
          totalMark += m;
          totalMax += c.maxMark ?? 0;
        }
      }
      const percentage = totalMax > 0 ? (totalMark / totalMax) * 100 : null;
      return {
        ...s,
        totalMark,
        totalMax,
        percentage,
        position: 0,
        positionLabel: "",
      };
    });

    // Sort descending by total score / percentage to determine rank
    rows.sort((a, b) => {
      const pB = b.percentage ?? -1;
      const pA = a.percentage ?? -1;
      if (pB !== pA) return pB - pA;
      return b.totalMark - a.totalMark;
    });

    // Assign rank / position (competition ranking)
    let currentRank = 1;
    for (let i = 0; i < rows.length; i++) {
      if (i > 0 && (rows[i].percentage ?? -1) < (rows[i - 1].percentage ?? -1)) {
        currentRank = i + 1;
      }
      rows[i].position = currentRank;
      rows[i].positionLabel = getOrdinal(currentRank);
    }

    return rows;
  }, [rawData, courses]);

  // Search filter
  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return studentRows;
    return studentRows.filter((s) =>
      [s.studentCode, s.studentName, s.positionLabel].join(" ").toLowerCase().includes(q)
    );
  }, [studentRows, search]);

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Overall class metrics
  const classAvg = useMemo(() => {
    const valid = studentRows.filter((s) => s.percentage != null);
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, s) => acc + (s.percentage ?? 0), 0);
    return sum / valid.length;
  }, [studentRows]);

  const totalPossibleMax = useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.maxMark ?? 0), 0);
  }, [courses]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading mid-term report data...</div>
      </div>
    );
  }

  if (!classId) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="text-gray-500">No class selected. Please go back to the mid-term report list.</p>
        <Button variant="outline" onClick={() => navigate("/midterm-reports")}>
          Back to Mid-Term Reports
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Ubrs — ${state.className || "Class"} Mid-Term Assessment`}
        description={`Mid-term assessment marks for ${state.className}`}
      />

      <div className="space-y-6">
        <div className="bg-white p-8 border border-gray-200 shadow-sm print:shadow-none print:border-none dark:bg-white/[0.03] dark:border-gray-800">
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="size-20 bg-white flex items-center justify-center border-2 border-gray-800 rounded-lg overflow-hidden">
                <img src="/images/logo/logo.png" alt="School Logo" className="w-full h-full object-contain p-2" />
              </div>
              <div>
                <div className="text-gray-800 dark:text-white text-2xl font-black tracking-widest uppercase">Umwana Bright Academy</div>
                <div className="text-gray-500 text-sm mt-1">Class Mid-Term Report</div>
                <div className="text-gray-800 dark:text-white font-bold mt-2 text-lg">
                  {state.className || "Class"} {state.classLevel ? `(${state.classLevel})` : ""}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Academic Year: {state.academicYear || "—"}</div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Report: {formatTerm(term)}</div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Level: {state.classLevel || "—"}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Class Teacher: {signatories?.classTeacher || state.classTeacher || "—"}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Students with grades: {studentRows.length}</div>
            </div>
          </div>
          <div className="flex justify-end gap-3 print:hidden mb-4">
            <button
              onClick={() => printPivotReport(state, courses, studentRows, signatories)}
              disabled={studentRows.length === 0}
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
            >
              Print Master Sheet
            </button>
            <button
              onClick={() => navigate("/midterm-reports")}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>

        {/* Main Content ComponentCard */}
        <ComponentCard
          title={`Mid Term Report`}
          titleClassName="text-lg sm:text-xl font-bold"
        >
          {/* Search bar */} 
            <div className="w-full max-w rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="grid gap-4 md:grid-cols-1fr items-end">
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Students</label>
                  <Input
                    placeholder="Search by student code, name, rank..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </div>  

          {/* Pivot Table: Courses as Columns, Students as Rows sorted by position */}
          {courses.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-base font-medium text-gray-500 dark:text-gray-400">
                No mid-term marks found for this class in {formatTerm(term)}.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Ensure teachers have submitted and approved mid-term marks for this term.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-3 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400 w-10"
                      >
                        #
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-brand-700 dark:text-brand-300 text-center text-theme-xs whitespace-nowrap w-20"
                      >
                        Position
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                      >
                        Student Code
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap min-w-[170px]"
                      >
                        Student Name
                      </TableCell>

                      {/* Dynamic Course Columns from the endpoint response */}
                      {courses.map((c) => (
                        <TableCell
                          key={c.courseId}
                          isHeader
                          className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200 text-center text-theme-xs whitespace-nowrap border-l border-gray-100 dark:border-white/[0.05]"
                        >
                          <div>{c.courseName}</div>
                          {c.maxMark != null && (
                            <span className="text-[10px] text-gray-400 font-normal">
                              (Max: {c.maxMark})
                            </span>
                          )}
                        </TableCell>
                      ))}

                      {/* Total & Percentage Columns */}
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-800 dark:text-white text-center text-theme-xs whitespace-nowrap border-l border-gray-200 dark:border-white/[0.1] bg-gray-50/50 dark:bg-white/[0.02]"
                      >
                        <div>Total</div>
                        {totalPossibleMax > 0 && (
                          <span className="text-[10px] text-gray-400 font-normal">
                            (Max: {totalPossibleMax})
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-800 dark:text-white text-center text-theme-xs whitespace-nowrap border-l border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02]"
                      >
                        %
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell
                        isHeader
                        className="px-4 py-3 font-semibold text-gray-800 dark:text-white text-center text-theme-xs whitespace-nowrap border-l border-gray-200 dark:border-white/[0.1] min-w-[140px]"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginatedStudents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          className="px-5 py-10 text-center text-gray-400 text-theme-sm"
                          colSpan={courses.length + 6}
                        >
                          No matching students found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStudents.map((s, idx) => {
                        const rowIdx = (currentPage - 1) * pageSize + idx + 1;
                        return (
                          <TableRow
                            key={s.studentId}
                            className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <TableCell className="px-3 py-3.5 text-center text-gray-400 text-theme-xs">
                              {rowIdx}
                            </TableCell>

                            {/* Position */}
                            <TableCell className="px-4 py-3.5 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-xs ${positionBadgeClass(
                                  s.position
                                )}`}
                              >
                                {s.positionLabel}
                              </span>
                            </TableCell>

                            <TableCell className="px-4 py-3.5 text-start text-gray-600 dark:text-gray-300 font-mono text-theme-xs whitespace-nowrap">
                              {s.studentCode}
                            </TableCell>
                            <TableCell className="px-4 py-3.5 text-start font-medium text-gray-800 dark:text-white/90 text-theme-sm whitespace-nowrap">
                              {s.studentName}
                            </TableCell>

                            {/* Marks for each course */}
                            {courses.map((c) => {
                              const mark = s.marks[c.courseId];
                              return (
                                <TableCell
                                  key={c.courseId}
                                  className="px-4 py-3.5 text-center text-theme-sm border-l border-gray-100 dark:border-white/[0.05]"
                                >
                                  {mark != null ? (
                                    <span className={markBadgeClass(mark, c.maxMark)}>
                                      {mark}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300 dark:text-gray-600">—</span>
                                  )}
                                </TableCell>
                              );
                            })}

                            {/* Total Mark */}
                            <TableCell className="px-4 py-3.5 text-center text-theme-sm font-bold text-gray-800 dark:text-white border-l border-gray-200 dark:border-white/[0.1] bg-gray-50/40 dark:bg-white/[0.01]">
                              {s.totalMark > 0 || Object.values(s.marks).some((m) => m != null)
                                ? s.totalMark.toFixed(1)
                                : "—"}
                            </TableCell>

                            {/* Percentage */}
                            <TableCell className="px-4 py-3.5 text-center text-theme-sm border-l border-gray-100 dark:border-white/[0.05] bg-gray-50/40 dark:bg-white/[0.01]">
                              {s.percentage != null ? (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.percentage >= 75
                                      ? "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300"
                                      : s.percentage >= 50
                                        ? "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300"
                                        : "bg-error-50 text-error-700 dark:bg-error-900/30 dark:text-error-300"
                                    }`}
                                >
                                  {s.percentage.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-600">—</span>
                              )}
                            </TableCell>

                            {/* Actions: View Marks & Print */}
                            <TableCell className="px-4 py-3.5 text-center border-l border-gray-200 dark:border-white/[0.1]">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  id={`view-marks-${s.studentId}`}
                                  onClick={() => setSelectedStudent(s)}
                                  title="View Student Mid-Term Marksheet"
                                  className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors dark:bg-brand-900/30 dark:text-brand-300"
                                >
                                  View
                                </button>
                                <button
                                  id={`print-student-${s.studentId}`}
                                  onClick={() =>
                                    printIndividualReport(
                                      s,
                                      state,
                                      courses,
                                      studentRows.length,
                                      signatories
                                    )
                                  }
                                  title="Print Student Report Card"
                                  className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/30 dark:text-emerald-300"
                                >
                                  Print
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Showing {filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{" "}
                    {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length}
                  </span>
                  <select
                    className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="justify-self-center">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm">
                      {currentPage} of {pageCount}
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
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Student Marksheet Report Modal */}
      <StudentReportModal
        student={selectedStudent}
        classInfo={state}
        courses={courses}
        totalStudents={studentRows.length}
        signatories={signatories}
        onClose={() => setSelectedStudent(null)}
        onPrint={(s) => printIndividualReport(s, state, courses, studentRows.length, signatories)}
      />
    </>
  );
}
