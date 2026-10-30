import { useState, useEffect, useMemo, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { useAuth } from "../../hooks/useAuth";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { parentDashboardService, ParentChildDto } from "../../services/parentDashboardService";
import { midTermReportService, MidTermReportProjection } from "../../services/midTermReportService";
import { studentFeePaymentService } from "../../services/studentFeePaymentService";
import { loadReportSignatories, ReportSignatories } from "./reportSignatures";
import { toast } from "../../utils/toast";

const formatTerm = (t?: string) => {
  if (!t) return "—";
  const cleaned = t.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned === "1" || cleaned === "TERM1" || cleaned === "FIRST" || cleaned === "FIRSTTERM") return "Term 1";
  if (cleaned === "2" || cleaned === "TERM2" || cleaned === "SECOND" || cleaned === "SECONDTERM") return "Term 2";
  if (cleaned === "3" || cleaned === "TERM3" || cleaned === "THIRD" || cleaned === "THIRDTERM") return "Term 3";
  return t.replace(/^TERM(\d)$/i, "Term $1");
};

function formatOrdinal(n: number): string {
  if (n <= 0) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function gradeFromPct(pct: number | null): { grade: string; remarks: string } {
  if (pct == null) return { grade: "—", remarks: "Not Graded" };
  if (pct >= 80) return { grade: "A", remarks: "Excellent" };
  if (pct >= 70) return { grade: "B", remarks: "Very Good" };
  if (pct >= 60) return { grade: "C", remarks: "Good" };
  if (pct >= 50) return { grade: "D", remarks: "Satisfactory" };
  if (pct >= 40) return { grade: "E", remarks: "Pass" };
  return { grade: "F", remarks: "Fail" };
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return "text-green-700 bg-green-50 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800";
    case "B":
      return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    case "C":
      return "text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800";
    case "D":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "E":
      return "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800";
    case "F":
      return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
}

interface ChildMidTermSummary {
  child: ParentChildDto;
  records: MidTermReportProjection[];
  totalMark: number;
  totalMax: number;
  percentage: number | null;
  grade: string;
  remarks: string;
  signatories: ReportSignatories | null;
  position: number | null;
  positionLabel: string;
  totalStudentsInClass: number;
}

function buildReportCardHTML(
  data: ChildMidTermSummary,
  academicYearLabel: string,
  termLabel: string
): string {
  const logoSrc = typeof window !== "undefined" ? `${window.location.origin}/images/logo/logo.png` : "/images/logo/logo.png";
  const teacherName = data.signatories?.classTeacher || "Class Teacher";
  const teacherSig = data.signatories?.classTeacherSignature || "";
  const headName = data.signatories?.headteacher || "Head Teacher";
  const headSig = data.signatories?.headteacherSignature || "";

  const courseRowsHtml = data.records
    .map((c, i) => {
      const mark = c.midTermMark;
      const max = c.midTermMaxMark ?? 0;
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

  return `
    <div style="font-family:'Times New Roman',Times,serif;max-width:850px;margin:0 auto;background:#fff;border:2px solid #000;box-sizing:border-box;color:#000;">
      <!-- HEADER -->
      <div style="padding:14px 20px;border-bottom:2px solid #000;display:flex;align-items:center;justify-content:space-between;gap:16px;">
        <img src="${logoSrc}" alt="Logo" style="width:72px;height:72px;object-fit:contain;border:1px solid #000;padding:4px;background:#fff;" />
        <div style="text-align:center;flex:1;">
          <div style="font-size:15px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;">REPUBLIC OF RWANDA</div>
          <div style="font-size:14px;font-weight:900;margin-top:2px;">MINISTRY OF EDUCATION</div>
          <div style="font-size:15px;font-weight:700;margin-top:3px;text-transform:uppercase;letter-spacing:0.5px;color:#1e3e6e;">UMWANA BRIGHT ACADEMY</div>
          <div style="font-size:11px;color:#444;margin-top:2px;">NYAMAGABE, Rwanda | wrrnouba@gmail.com | +250781107910</div>
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
            <td style="width:50%;"><strong>Student Name:</strong> ${data.child.studentName}</td>
            <td style="width:50%;"><strong>Registration No / Code:</strong> ${data.child.studentCode}</td>
          </tr>
          <tr>
            <td><strong>Class:</strong> ${data.child.schoolClassName || "—"} ${data.child.classLevel ? `(${data.child.classLevel})` : ""}</td>
            <td><strong>Term / Academic Year:</strong> ${termLabel} / ${academicYearLabel}</td>
          </tr>
          <tr>
            <td><strong>Class Teacher:</strong> ${teacherName}</td>
            <td><strong>Class Position:</strong> ${data.positionLabel || "—"}</td>
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
              <th style="padding:6px;border:1px solid #000;text-align:center;width:95px;">Mark Obtained</th>
              <th style="padding:6px;border:1px solid #000;text-align:center;width:85px;">Max Mark</th>
              <th style="padding:6px;border:1px solid #000;text-align:center;width:80px;">Percentage</th>
              <th style="padding:6px;border:1px solid #000;text-align:center;width:60px;">Grade</th>
              <th style="padding:6px 8px;border:1px solid #000;text-align:left;width:125px;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${courseRowsHtml}
            <!-- TOTAL & AVERAGE ROW -->
            <tr style="background:#f3f4f6;font-weight:bold;">
              <td colspan="2" style="padding:8px;border:1px solid #000;text-align:right;">TOTAL SCORE:</td>
              <td style="padding:8px;border:1px solid #000;text-align:center;font-size:13px;">${data.totalMark.toFixed(1)}</td>
              <td style="padding:8px;border:1px solid #000;text-align:center;font-size:13px;">${data.totalMax}</td>
              <td style="padding:8px;border:1px solid #000;text-align:center;font-size:13px;">${data.percentage != null ? `${data.percentage.toFixed(1)}%` : "—"}</td>
              <td style="padding:8px;border:1px solid #000;text-align:center;font-size:13px;">${data.grade}</td>
              <td style="padding:8px 8px;border:1px solid #000;text-align:left;font-size:11px;">${data.remarks}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PERFORMANCE SUMMARY BOX -->
      <div style="margin:0 18px 12px;padding:8px 12px;border:1px solid #000;background:#fafafa;font-size:11px;display:flex;justify-content:space-between;align-items:center;">
        <div><strong>Overall Percentage:</strong> ${data.percentage != null ? `${data.percentage.toFixed(1)}%` : "—"}</div>
        <div><strong>Overall Grade:</strong> ${data.grade} (${data.remarks})</div>
        <div><strong>Class Position / Rank:</strong> ${data.positionLabel || "—"}</div>
        <div><strong>Courses Assessed:</strong> ${data.records.length}</div>
      </div>

      <!-- COMMENTS SECTION -->
      <div style="margin:0 18px 14px;border:1px solid #000;padding:8px 12px;font-size:11px;">
        <div style="font-weight:bold;margin-bottom:4px;">Class Teacher's Remark:</div>
        <div style="min-height:22px;border-bottom:1px dotted #888;color:${data.percentage != null && data.percentage < 60 ? '#b91c1c;font-weight:bold;' : '#000;'}">${
          data.percentage != null && data.percentage < 60
            ? "⚠️ Marks below 60%. Parent has to come to school for an in-person academic consultation."
            : data.percentage != null && data.percentage >= 70
              ? "Very commendable performance! Keep maintaining this standard."
              : "Fair progress shown. More effort needed in challenging courses."
        }</div>
      </div>

      <!-- SIGNATURES -->
      <div style="padding:16px 30px;border-top:2px solid #000;display:flex;justify-content:space-between;font-size:11px;">
        <div style="text-align:center;min-width:170px;">
          <div style="font-size:12px;font-weight:bold;">${teacherName}</div>
          <div style="min-height:40px;display:flex;align-items:center;justify-content:center;margin:4px 0;">
            ${teacherSig ? `<img src="${teacherSig}" alt="Signature" style="max-height:38px;max-width:140px;object-fit:contain;"/>` : `<div style="height:25px;"></div>`}
          </div>
          <div style="border-top:1px solid #000;padding-top:3px;"><strong>Class Teacher Signature</strong></div>
        </div>

        <div style="text-align:center;min-width:170px;">
          <div style="font-size:12px;font-weight:bold;">${headName}</div>
          <div style="min-height:40px;display:flex;align-items:center;justify-content:center;margin:4px 0;">
            ${headSig ? `<img src="${headSig}" alt="Signature" style="max-height:38px;max-width:140px;object-fit:contain;"/>` : `<div style="height:25px;"></div>`}
          </div>
          <div style="border-top:1px solid #000;padding-top:3px;"><strong>Head Teacher Signature</strong></div>
        </div>
      </div>
    </div>
  `;
}

function printReport(data: ChildMidTermSummary, academicYearLabel: string, termLabel: string) {
  const html = buildReportCardHTML(data, academicYearLabel, termLabel);
  const win = window.open("", "_blank", "width=900,height=750");
  if (!win) {
    toast.error("Please allow pop-ups to print the report card.");
    return;
  }
  win.document.open();
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mid-Term Report — ${data.child.studentName}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { margin: 0; padding: 10px; font-family: 'Times New Roman', serif; background: #fff; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

interface ModalProps {
  data: ChildMidTermSummary | null;
  academicYearLabel: string;
  termLabel: string;
  onClose: () => void;
  onPrint: (data: ChildMidTermSummary) => void;
}

function MidTermReportModal({ data, academicYearLabel, termLabel, onClose, onPrint }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [data, onClose]);

  if (!data) return null;

  const html = buildReportCardHTML(data, academicYearLabel, termLabel);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-gray-100 shadow-2xl p-4 rounded-xl" id="parent-midterm-modal">
        <div className="absolute -top-12 right-4 flex gap-2 print:hidden">
          <button
            onClick={() => onPrint(data)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold text-xs px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Download PDF
          </button>
          <button
            onClick={onClose}
            className="size-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors shadow-sm"
          >
            ✕
          </button>
        </div>
        <div
          className="bg-white shadow-lg overflow-auto rounded-lg"
          style={{ maxHeight: "calc(100vh - 80px)", minHeight: "80vh" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export default function ParentMidTermReports() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ParentChildDto[]>([]);
  const [activeYear, setActiveYear] = useState<AcademicYearResponseDto | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("ALL");
  const [selectedTerm, setSelectedTerm] = useState<string>("TERM1");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [rawReports, setRawReports] = useState<MidTermReportProjection[]>([]);
  const [classRankingMap, setClassRankingMap] = useState<
    Record<string, Record<string, { rank: number; totalStudents: number; positionLabel: string }>>
  >({});
  const [feePaidMap, setFeePaidMap] = useState<Record<string, boolean>>({});
  const [signatoriesMap, setSignatoriesMap] = useState<Record<string, ReportSignatories>>({});
  const [modalData, setModalData] = useState<ChildMidTermSummary | null>(null);

  // 1. Load active academic year and children linked to this parent
  useEffect(() => {
    const init = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [childrenList, yearsList] = await Promise.all([
          parentDashboardService.getChildren(user.userId),
          academicYearService.getAllAcademicYears(),
        ]);
        setChildren(childrenList);

        // Strictly use active academic year as requested
        const active = yearsList.find((y) => y.academicYearStatus === "ACTIVE") || null;
        setActiveYear(active);

        // Pre-load signatories for each child's class
        const sigs: Record<string, ReportSignatories> = {};
        for (const child of childrenList) {
          if (child.schoolClassId && !sigs[child.schoolClassId]) {
            try {
              sigs[child.schoolClassId] = await loadReportSignatories(child.schoolClassId);
            } catch {
              // ignore signatory errors
            }
          }
        }
        setSignatoriesMap(sigs);
      } catch (err) {
        console.error("Failed to load parent initial data", err);
        toast.error("Failed to load your children or active academic year");
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [user?.userId]);

  // 2. Fetch mid-term report data for active academic year & selected term + class ranking for positions
  useEffect(() => {
    const fetchReportsAndRankings = async () => {
      if (!user?.userId || !activeYear?.academicYearId) {
        setRawReports([]);
        setClassRankingMap({});
        return;
      }
      setLoadingReports(true);
      try {
        // Fetch parent mid-term marks
        const res = await midTermReportService.getMidTermReportByParent(
          user.userId,
          activeYear.academicYearId,
          selectedTerm
        );
        setRawReports(res || []);

        // Also fetch class-level mid-term marks for each distinct class to compute positions
        const distinctClassIds = Array.from(
          new Set(children.map((c) => c.schoolClassId).filter(Boolean) as string[])
        );

        const newRankingMap: Record<
          string,
          Record<string, { rank: number; totalStudents: number; positionLabel: string }>
        > = {};

        await Promise.all(
          distinctClassIds.map(async (classId) => {
            try {
              const classData = await midTermReportService.getMidTermReportByTerm(
                activeYear.academicYearId,
                classId,
                selectedTerm
              );

              if (classData && classData.length > 0) {
                // Group students in this class
                const studentScores = new Map<string, { totalMark: number; totalMax: number }>();
                for (const item of classData) {
                  if (!studentScores.has(item.studentId)) {
                    studentScores.set(item.studentId, { totalMark: 0, totalMax: 0 });
                  }
                  const s = studentScores.get(item.studentId)!;
                  if (item.midTermMark != null) {
                    s.totalMark += item.midTermMark;
                  }
                  if (item.midTermMaxMark != null) {
                    s.totalMax += item.midTermMaxMark;
                  }
                }

                // Compute pct and sort descending
                const studentList = Array.from(studentScores.entries()).map(([id, scores]) => ({
                  studentId: id,
                  totalMark: scores.totalMark,
                  percentage: scores.totalMax > 0 ? (scores.totalMark / scores.totalMax) * 100 : 0,
                }));

                studentList.sort((a, b) => {
                  if (b.percentage !== a.percentage) return b.percentage - a.percentage;
                  return b.totalMark - a.totalMark;
                });

                const totalStudents = studentList.length;
                const classMap: Record<string, { rank: number; totalStudents: number; positionLabel: string }> = {};

                let currentRank = 1;
                for (let i = 0; i < studentList.length; i++) {
                  if (i > 0 && studentList[i].percentage < studentList[i - 1].percentage) {
                    currentRank = i + 1;
                  }
                  classMap[studentList[i].studentId] = {
                    rank: currentRank,
                    totalStudents,
                    positionLabel: `${formatOrdinal(currentRank)} / ${totalStudents}`,
                  };
                }
                newRankingMap[classId] = classMap;
              }
            } catch {
              // ignore error for single class
            }
          })
        );

        setClassRankingMap(newRankingMap);
      } catch (err) {
        console.error("Failed to load mid-term reports for parent", err);
        toast.error("Unable to load mid-term marks for active academic year");
        setRawReports([]);
      } finally {
        setLoadingReports(false);
      }
    };
    void fetchReportsAndRankings();
  }, [user?.userId, activeYear?.academicYearId, selectedTerm, children]);

  // 3. Fetch school fee payment statuses for the active year and term
  useEffect(() => {
    if (!children.length || !activeYear?.academicYearId) {
      setFeePaidMap({});
      return;
    }
    const checkFeePayments = async () => {
      const map: Record<string, boolean> = {};
      await Promise.all(
        children.map(async (child) => {
          try {
            const paid = await studentFeePaymentService.isStudentPayFees(
              child.studentId,
              selectedTerm as any,
              activeYear.academicYearId
            );
            map[child.studentId] = paid;
          } catch {
            map[child.studentId] = false;
          }
        })
      );
      setFeePaidMap(map);
    };
    void checkFeePayments();
  }, [children, selectedTerm, activeYear?.academicYearId]);

  // 4. Compute summaries for each child
  const childSummaries: ChildMidTermSummary[] = useMemo(() => {
    return children.map((child) => {
      const records = rawReports.filter(
        (r) =>
          r.studentId === child.studentId ||
          (r.studentCode && r.studentCode.trim().toLowerCase() === child.studentCode?.trim().toLowerCase())
      );

      let totalMark = 0;
      let totalMax = 0;
      let gradedCount = 0;

      records.forEach((r) => {
        if (r.midTermMark != null) {
          totalMark += r.midTermMark;
          gradedCount += 1;
        }
        if (r.midTermMaxMark != null) {
          totalMax += r.midTermMaxMark;
        }
      });

      const percentage = totalMax > 0 && gradedCount > 0 ? (totalMark / totalMax) * 100 : null;
      const { grade, remarks } = gradeFromPct(percentage);

      // Determine rank / position from classRankingMap
      const classRankData = child.schoolClassId
        ? classRankingMap[child.schoolClassId]?.[child.studentId]
        : null;

      const position = classRankData ? classRankData.rank : null;
      const positionLabel = classRankData ? classRankData.positionLabel : "";
      const totalStudentsInClass = classRankData ? classRankData.totalStudents : 1;

      return {
        child,
        records,
        totalMark,
        totalMax,
        percentage,
        grade,
        remarks,
        signatories: child.schoolClassId ? signatoriesMap[child.schoolClassId] || null : null,
        position,
        positionLabel,
        totalStudentsInClass,
      };
    });
  }, [children, rawReports, signatoriesMap, classRankingMap]);

  // 5. Filter visible children: Do NOT display cards when mid term is empty for that term!
  const visibleSummaries = useMemo(() => {
    // Only display card if the child has actual mid-term assessment marks recorded!
    const withMarks = childSummaries.filter(
      (s) => s.records.length > 0 && s.records.some((r) => r.midTermMark != null)
    );
    if (selectedChildId === "ALL") return withMarks;
    return withMarks.filter((s) => s.child.studentId === selectedChildId);
  }, [childSummaries, selectedChildId]);

  const activeYearLabel = activeYear?.fiscalYear || "Active Year";
  const termLabel = formatTerm(selectedTerm);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading your children's mid-term assessments...</div>;
  }

  return (
    <>
      <PageMeta
        title="Ubrs — Children Mid-Term Reports"
        description="View and print mid-term assessment reports for your children in the active academic year."
      />

      <MidTermReportModal
        data={modalData}
        academicYearLabel={activeYearLabel}
        termLabel={termLabel}
        onClose={() => setModalData(null)}
        onPrint={(d) => printReport(d, activeYearLabel, termLabel)}
      />

      <div className="space-y-6">
        <ComponentCard title="Mid-Term Reports" titleClassName="text-xl sm:text-2xl">
          {/* Active Academic Year Banner & Filters */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
            <div className="grid gap-4 sm:grid-cols-3 items-end">
              {/* Active Academic Year Card (Fixed to active academic year as requested) */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Academic Year
                </label>
                <div className="flex items-center justify-between h-11 w-full rounded-lg border border-emerald-300 bg-emerald-50/60 px-4 text-sm font-semibold text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{activeYearLabel}</span>
                  </div>
                </div>
              </div>

              {/* Child Selector */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Select Child
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                >
                  <option value="ALL">All Children ({children.length})</option>
                  {children.map((c) => (
                    <option key={c.studentId} value={c.studentId}>
                      {c.studentName} ({c.schoolClassName || "Class N/A"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Term Selector */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Evaluation Term
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  <option value="TERM1">Term 1</option>
                  <option value="TERM2">Term 2</option>
                  <option value="TERM3">Term 3</option>
                </select>
              </div>
            </div>
          </div>

          {/* Body Content */}
          {loadingReports ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent mb-2"></div>
              <div>Fetching mid-term evaluation marks for {termLabel}...</div>
            </div>
          ) : visibleSummaries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
              <div className="mx-auto size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950/40 dark:text-amber-400 mb-3">
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 text-base">No Mid-Term Reports for {termLabel}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-md mx-auto">
                No mid-term evaluation marks have been recorded or published for {selectedChildId === "ALL" ? "your children" : "this child"} in {termLabel} ({activeYearLabel}).
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {visibleSummaries.map((summary) => {
                const { child, records, totalMark, totalMax, percentage, grade, remarks, positionLabel } = summary;
                const isPaid = !!feePaidMap[child.studentId];
                const isBelow60 = percentage != null && percentage < 60;

                return (
                  <div
                    key={child.studentId}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]"
                  >
                    {/* Header Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/75 p-6 dark:border-gray-800 dark:bg-gray-900/30">
                      <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 font-bold text-brand-600 text-lg dark:bg-brand-900/30 dark:text-brand-300">
                          {child.studentName ? child.studentName.slice(0, 2).toUpperCase() : "ST"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{child.studentName}</h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {child.schoolClassName || "—"}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Code: <strong className="text-gray-700 dark:text-gray-300">{child.studentCode}</strong></span>
                            <span>•</span>
                            <span>Level: <strong className="text-gray-700 dark:text-gray-300">{child.classLevel || "—"}</strong></span>
                            <span>•</span>
                            <span>Period: <strong className="text-gray-700 dark:text-gray-300">{termLabel} ({activeYearLabel})</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons & Status */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isPaid ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setModalData(summary)}
                            >
                              View Marksheet
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => printReport(summary, activeYearLabel, termLabel)}
                            >
                              Print / Download PDF
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                              Fee Not Yet Cleared
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setModalData(summary)}
                              title="Preview marksheet on screen"
                            >
                              View Marksheet
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alert comment when marks are below 60% */}
                    {isBelow60 && (
                      <div className="mx-6 mt-4 p-4 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 flex items-start gap-3.5 shadow-sm">
                        <div className="size-9 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 font-bold text-base">
                          ⚠️
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-rose-800 dark:text-rose-300">
                            Academic Alert: Marks Below 60%
                          </div>
                          <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-1 font-medium leading-relaxed">
                            This student scored below the passing benchmark (60%). Parent has to come to school for an in-person academic consultation with the class teacher.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quick Stats Pill Row including Position */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 bg-gray-50/30 border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/10 text-center">
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 dark:bg-gray-800/40 dark:border-gray-700">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Courses</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{records.length}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 dark:bg-gray-800/40 dark:border-gray-700">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Score</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                          {totalMark.toFixed(1)} <span className="text-xs text-gray-400 font-normal">/ {totalMax}</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 dark:bg-gray-800/40 dark:border-gray-700">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Percentage</div>
                        <div className={`text-xl font-bold mt-0.5 ${isBelow60 ? "text-red-600 dark:text-red-400" : "text-brand-600 dark:text-brand-400"}`}>
                          {percentage != null ? `${percentage.toFixed(1)}%` : "—"}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 dark:bg-gray-800/40 dark:border-gray-700">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Grade</div>
                        <div className="mt-0.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${getGradeColor(grade)}`}>
                            {grade} ({remarks})
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-gray-200/80 dark:bg-gray-800/40 dark:border-gray-700">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Position</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                          {positionLabel || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Table of Course Marks */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                          <TableRow>
                            <TableCell isHeader className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mark Obtained</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Max Mark</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grade</TableCell>
                            <TableCell isHeader className="px-5 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks</TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {records.map((r, i) => {
                            const mark = r.midTermMark;
                            const max = r.midTermMaxMark ?? 0;
                            const pct = mark != null && max > 0 ? (mark / max) * 100 : null;
                            const g = gradeFromPct(pct);

                            return (
                              <TableRow key={r.courseId || i} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                                <TableCell className="px-5 py-3 text-xs text-gray-400">{i + 1}</TableCell>
                                <TableCell className="px-5 py-3">
                                  <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{r.courseName}</div>
                                  <div className="text-xs text-gray-400">{r.courseCode}</div>
                                </TableCell>
                                <TableCell className="px-5 py-3 text-center font-bold text-sm text-gray-900 dark:text-white">
                                  {mark != null ? mark : "—"}
                                </TableCell>
                                <TableCell className="px-5 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                                  {max > 0 ? max : "—"}
                                </TableCell>
                                <TableCell className="px-5 py-3 text-center">
                                  {pct != null ? (
                                    <div className="inline-flex items-center gap-1.5 font-semibold text-xs text-gray-700 dark:text-gray-300">
                                      <span>{pct.toFixed(1)}%</span>
                                    </div>
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                                <TableCell className="px-5 py-3 text-center">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${getGradeColor(g.grade)}`}>
                                    {g.grade}
                                  </span>
                                </TableCell>
                                <TableCell className="px-5 py-3 text-xs text-gray-600 dark:text-gray-400">
                                  {g.remarks}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
