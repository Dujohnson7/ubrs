import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { ClassApproval, SubjectEntry, ApprovalStatus, sampleApprovalData, gradeColor } from "./approvalData";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import ComponentCard from "../../components/common/ComponentCard";

export default function SubjectMarksApproval() {
  const { classId, subjectId } = useParams<{ classId: string; subjectId: string }>();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState<ClassApproval | null>(null);
  const [subject, setSubject] = useState<SubjectEntry | null>(null);

  const [remarks, setRemarks] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const foundClass = sampleApprovalData.find((c) => c.classId === classId);
    if (foundClass) {
      setClassInfo(foundClass);
      const foundSub = foundClass.subjects.find((s) => s.subjectId === subjectId);
      if (foundSub) {
        setSubject(foundSub);
        setRemarks(foundSub.remarks || "");
      }
    }
  }, [classId, subjectId]);

  if (!classInfo || !subject) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const avg = subject.studentMarks.length
    ? Math.round(subject.studentMarks.reduce((s: number, m: { total: number }) => s + m.total, 0) / subject.studentMarks.length)
    : 0;

  const canAct = subject.cat1Submitted && subject.cat2Submitted && subject.examSubmitted && subject.status !== "approved";

  const handleAction = (action: "approve" | "reject") => {
    const now = new Date().toLocaleString("en-RW");
    const updatedStatus = action === "approve" ? "approved" : "rejected";
    
    // In a real app, this would be an API call
    setSubject((prev: SubjectEntry | null) => prev ? { 
      ...prev, 
      status: updatedStatus as ApprovalStatus, 
      approvedAt: action === "approve" ? now : null, 
      remarks 
    } : null);
    
    setIsApproving(false);
    setIsRejecting(false);
    
    // Auto navigate back after short delay on success
    setTimeout(() => {
      navigate(`/marks-approval/${classId}`);
    }, 1000);
  };

  return (
    <>
      <PageMeta title={`Ubrs — ${subject.subject} Marks Review`} description={`Review student marks for ${subject.subject}`} />


      <div className="space-y-6">
        <ComponentCard title={`${subject.subject} Review`}>
          {/* Approval Panel as Top Filter Panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-widest font-bold">Reviewing Subject Marks</div>
                  <div className="text-gray-800 dark:text-white text-xl font-black">{subject.subject}</div>
                  <div className="text-gray-500 text-sm">{classInfo.className} · {subject.teacherName}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {subject.status !== "approved" && (
                  <>
                    <input
                      className="h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 text-sm text-gray-800 dark:text-gray-100 focus:outline-none w-48"
                      placeholder="Rejection reason..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                    <button
                      onClick={() => { setIsRejecting(true); handleAction("reject"); }}
                      disabled={!canAct || !remarks.trim()}
                      className="h-10 px-4 flex items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isRejecting ? "..." : "Reject"}
                    </button>
                    <button
                      onClick={() => { setIsApproving(true); handleAction("approve"); }}
                      disabled={!canAct}
                      className="h-10 px-4 flex items-center justify-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isApproving ? "..." : "Approve"}
                    </button>
                  </>
                )}
                {subject.status === "approved" && (
                  <span className="text-green-600 font-bold px-3 py-1 bg-green-50 rounded-lg text-sm border border-green-200">
                    Approved
                  </span>
                )}
                <button
                  onClick={() => navigate(`/marks-approval/${classId}`)}
                  className="h-10 px-4 inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 ml-2"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          <div>

              {/* Marks table */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Code</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Student Name</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Gender</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">CAT 1</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">CAT 2</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Exam</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Total</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Grade</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subject.studentMarks.map((m, i) => {
                      const col = gradeColor(m.total);
                      return (
                        <TableRow key={m.studentCode} className={`${i % 2 === 0 ? "bg-white dark:bg-gray-900/20" : "bg-gray-50/50 dark:bg-gray-800/20"} hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors border-b border-gray-100 dark:border-gray-800`}>
                          <TableCell className="px-5 py-3.5 text-gray-400 text-xs font-medium">{i + 1}</TableCell>
                          <TableCell className="px-5 py-3.5">
                            <span className="text-xs font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">{m.studentCode}</span>
                          </TableCell>
                          <TableCell className="px-5 py-3.5 font-bold text-gray-800 dark:text-gray-200 text-sm">{m.studentName}</TableCell>
                          <TableCell className="px-5 py-3.5 text-center">
                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold tracking-wide ${m.gender === "Female" ? "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300" : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                              {m.gender === "Female" ? "♀" : "♂"} {m.gender}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-gray-300">{m.cat1}</TableCell>
                          <TableCell className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-gray-300">{m.cat2}</TableCell>
                          <TableCell className="px-5 py-3.5 text-center font-semibold text-gray-700 dark:text-gray-300">{m.exam}</TableCell>
                          <TableCell className="px-5 py-3.5 text-center font-black text-gray-900 dark:text-white text-base">{m.total}</TableCell>
                          <TableCell className="px-5 py-3.5 text-center">
                            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider" style={{ background: col.bg, color: col.text, border: `1px solid ${col.text}33` }}>{m.grade}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <tfoot>
                    <TableRow className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                      <TableCell colSpan={7} className="px-5 py-3.5 text-right font-bold text-gray-600 dark:text-gray-300">Class Average</TableCell>
                      <TableCell className="px-5 py-3.5 text-center font-black text-base text-gray-800 dark:text-gray-200">{avg}</TableCell>
                      <TableCell className="px-5 py-3.5 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-50 text-brand-700">{avg >= 80?"A1":avg>=70?"B2":avg>=60?"B3":avg>=50?"C4":"D"}</span>
                      </TableCell>
                    </TableRow>
                  </tfoot>
                </Table>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
