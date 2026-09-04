import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import ComponentCard from "../../components/common/ComponentCard";
import { gradeService, GradeResponseDto } from "../../services/gradeService";
import { gradeColor, normalizeApprovalStatus } from "./approvalData";
import { toast } from "../../utils/toast";

type StudentRecord = {
  studentId: string;
  studentCode: string;
  studentName: string;
  test: number | null;
  exam: number | null;
  total: number;
  grade: string;
};

export default function SubjectMarksApproval() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    classId?: string;
    academicYearId?: string;
    term?: string;
    subjectId?: string;
    className?: string;
    courseName?: string;
    teacherName?: string;
    status?: string;
  } | null;

  const [grades, setGrades] = useState<GradeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(normalizeApprovalStatus(state?.status));
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>([]);

  const backState = {
    classId: state?.classId,
    academicYearId: state?.academicYearId,
    term: state?.term,
    className: state?.className,
  };

  useEffect(() => {
    const fetchGrades = async () => {
      if (!state?.academicYearId || !state?.term || !state?.classId || !state?.subjectId) {
        setLoading(false);
        return;
      }
      try {
        const res = await gradeService.getAllByAcademicYearAndTermAndSchoolClassAndCourse(
          state.academicYearId,
          state.term,
          state.classId,
          state.subjectId
        );
        setGrades(res);

        if (res.length > 0) {
          const statuses = res.map((g) => normalizeApprovalStatus(g.submitStatus));
          if (statuses.every((s) => s === "approved")) setCurrentStatus("approved");
          else if (statuses.some((s) => s === "rejected")) setCurrentStatus("rejected");
          else if (statuses.some((s) => s === "submitted")) setCurrentStatus("submitted");
          else setCurrentStatus("pending");
        } else {
          setCurrentStatus(normalizeApprovalStatus(state.status));
        }

        const recordsMap: Record<string, StudentRecord> = {};
        res.forEach((gradeObj) => {
          gradeObj.gradeDetails.forEach((detail) => {
            if (!recordsMap[detail.studentId]) {
              recordsMap[detail.studentId] = {
                studentId: detail.studentId,
                studentCode: detail.studentCode,
                studentName: detail.studentName,
                test: null,
                exam: null,
                total: 0,
                grade: "N/A",
              };
            }
            if (gradeObj.gradeType === "TEST") {
              recordsMap[detail.studentId].test = detail.mark;
            } else if (gradeObj.gradeType === "EXAM") {
              recordsMap[detail.studentId].exam = detail.mark;
            }
          });
        });

        const recordsList = Object.values(recordsMap).map((r) => {
          const t = (r.test || 0) + (r.exam || 0);
          return {
            ...r,
            total: t,
            grade: t >= 80 ? "A1" : t >= 70 ? "B2" : t >= 60 ? "B3" : t >= 50 ? "C4" : "F",
          };
        });

        recordsList.sort((a, b) => a.studentName.localeCompare(b.studentName));
        setStudentRecords(recordsList);
      } catch (error) {
        console.error("Failed to fetch student grades", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [state?.academicYearId, state?.term, state?.classId, state?.subjectId, state?.status]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!state) return <div className="p-10 text-center text-gray-500">Missing class context</div>;

  const avg = studentRecords.length
    ? Math.round(studentRecords.reduce((s, m) => s + m.total, 0) / studentRecords.length)
    : 0;

  const submittedGradeIds = grades
    .filter((g) => normalizeApprovalStatus(g.submitStatus) === "submitted")
    .map((g) => g.gradeId);

  const canAct = studentRecords.length > 0 && currentStatus === "submitted" && submittedGradeIds.length > 0;

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !remarks.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    if (submittedGradeIds.length === 0) {
      toast.error("No submitted grades to process");
      return;
    }

    setIsApproving(action === "approve");
    setIsRejecting(action === "reject");
    try {
      if (action === "approve") {
        await Promise.all(submittedGradeIds.map((id) => gradeService.approveGrade(id)));
        setCurrentStatus("approved");
      } else {
        await Promise.all(submittedGradeIds.map((id) => gradeService.rejectGrade(id, remarks.trim())));
        setCurrentStatus("rejected");
      }
      navigate("/marks-approval/details", { state: backState });
    } catch (error) {
      console.error(error);
    } finally {
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  return (
    <>
      <PageMeta title={`Ubrs — ${state.courseName} Marks Review`} description={`Review student marks for ${state.courseName}`} />

      <div className="space-y-6">
        <ComponentCard title={`${state.courseName} Review`}>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-widest font-bold">Reviewing Subject Marks</div>
                  <div className="text-gray-800 dark:text-white text-xl font-black">{state.courseName}</div>
                  <div className="text-gray-500 text-sm">{state.className} · {state.teacherName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {currentStatus !== "approved" && (
                  <>
                    <input
                      className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 text-sm text-gray-800 dark:text-gray-100 focus:outline-none w-48"
                      placeholder="Rejection reason..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={!canAct || !remarks.trim() || isRejecting || isApproving}
                      className="h-10 px-4 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isRejecting ? "..." : "Reject"}
                    </button>
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={!canAct || isApproving || isRejecting}
                      className="h-10 px-4 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isApproving ? "..." : "Approve"}
                    </button>
                  </>
                )}
                {currentStatus === "approved" && (
                  <span className="text-green-600 font-bold px-3 py-1 bg-green-50 rounded-lg text-sm border border-green-200">
                    Approved
                  </span>
                )}
                <button
                  onClick={() => navigate("/marks-approval/details", { state: backState })}
                  className="h-10 px-4 inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ml-2"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Code</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Student Name</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Test</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Exam</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Total</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Grade</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500">No grades found for this subject.</TableCell>
                      </TableRow>
                    ) : (
                      studentRecords.map((m, i) => {
                        const col = gradeColor(m.total);
                        return (
                          <TableRow key={m.studentCode} className={`${i % 2 === 0 ? "bg-white dark:bg-gray-900/20" : "bg-gray-50/50 dark:bg-gray-800/20"} hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors border-b border-gray-100 dark:border-gray-800`}>
                            <TableCell className="px-5 py-3.5 text-gray-400 text-xs font-medium">{i + 1}</TableCell>
                            <TableCell className="px-5 py-3.5">
                              <span className="text-xs font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">{m.studentCode}</span>
                            </TableCell>
                            <TableCell className="px-5 py-3.5 font-bold text-gray-800 dark:text-gray-200 text-sm">{m.studentName}</TableCell>
                            <TableCell className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-gray-300">{m.test ?? "-"}</TableCell>
                            <TableCell className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-gray-300">{m.exam ?? "-"}</TableCell>
                            <TableCell className="px-5 py-3.5 text-center font-black text-gray-900 dark:text-white text-base">{m.total}</TableCell>
                            <TableCell className="px-5 py-3.5 text-center">
                              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider" style={{ background: col.bg, color: col.text, border: `1px solid ${col.text}33` }}>{m.grade}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                  {studentRecords.length > 0 && (
                    <tfoot>
                      <TableRow className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                        <TableCell colSpan={5} className="px-5 py-3.5 text-right font-bold text-gray-600 dark:text-gray-300">Class Average</TableCell>
                        <TableCell className="px-5 py-3.5 text-center font-black text-base text-gray-800 dark:text-gray-200">{avg}</TableCell>
                        <TableCell className="px-5 py-3.5 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-50 text-brand-700">{avg >= 80 ? "A1" : avg >= 70 ? "B2" : avg >= 60 ? "B3" : avg >= 50 ? "C4" : "F"}</span>
                        </TableCell>
                      </TableRow>
                    </tfoot>
                  )}
                </Table>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
