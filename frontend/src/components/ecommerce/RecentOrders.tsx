import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useNavigate } from "react-router";

type MarkStatus = "Approved" | "Submitted" | "Pending" | "Rejected";

interface RecentMark {
  id: number;
  classId: string;
  className: string;
  subject: string;
  teacher: string;
  studentsCount: number;
  avgScore: number;
  status: MarkStatus;
  submittedAt: string;
}

const recentMarks: RecentMark[] = [
  {
    id: 1,
    classId: "C101",
    className: "Primary 1A",
    subject: "Mathematics",
    teacher: "Mr. Alain Habimana",
    studentsCount: 10,
    avgScore: 76,
    status: "Submitted",
    submittedAt: "2026-07-20",
  },
  {
    id: 2,
    classId: "C101",
    className: "Primary 1A",
    subject: "Science & Technology",
    teacher: "Mrs. Diane Uwase",
    studentsCount: 10,
    avgScore: 81,
    status: "Approved",
    submittedAt: "2026-07-19",
  },
  {
    id: 3,
    classId: "C101",
    className: "Primary 1A",
    subject: "Social Studies",
    teacher: "Mr. Emmanuel Nkusi",
    studentsCount: 10,
    avgScore: 59,
    status: "Rejected",
    submittedAt: "2026-07-18",
  },
  {
    id: 4,
    classId: "C102",
    className: "Primary 1B",
    subject: "Mathematics",
    teacher: "Mr. Alain Habimana",
    studentsCount: 10,
    avgScore: 80,
    status: "Approved",
    submittedAt: "2026-07-20",
  },
  {
    id: 5,
    classId: "N101",
    className: "Nursery A",
    subject: "Numbers & Counting",
    teacher: "Ms. Claudette Ingabire",
    studentsCount: 4,
    avgScore: 88,
    status: "Approved",
    submittedAt: "2026-07-19",
  },
  {
    id: 6,
    classId: "C201",
    className: "Primary 2A",
    subject: "English Language",
    teacher: "Ms. Janet Mukamana",
    studentsCount: 10,
    avgScore: 69,
    status: "Pending",
    submittedAt: "—",
  },
];

function gradeFromScore(score: number): string {
  if (score >= 80) return "A1";
  if (score >= 70) return "B2";
  if (score >= 60) return "B3";
  if (score >= 50) return "C4";
  return "D";
}

const STATUS_COLOR: Record<MarkStatus, "success" | "error" | "warning" | "info"> = {
  Approved: "success",
  Submitted: "info",
  Pending: "warning",
  Rejected: "error",
};

export default function RecentOrders() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Mark Submissions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Latest subject marks submitted by teachers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/marks-approval")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            See all
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              {["Class", "Subject", "Teacher", "Students", "Avg Score", "Grade", "Status", "Submitted"].map(
                (h) => (
                  <TableCell
                    key={h}
                    isHeader
                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap px-3"
                  >
                    {h}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentMarks.map((mark) => {
              const grade = gradeFromScore(mark.avgScore);
              const scoreColor =
                mark.avgScore >= 80
                  ? "text-green-600"
                  : mark.avgScore >= 60
                  ? "text-blue-600"
                  : mark.avgScore >= 50
                  ? "text-amber-600"
                  : "text-red-600";

              return (
                <TableRow
                  key={mark.id}
                  className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => navigate(`/marks-approval/${mark.classId}`)}
                >
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {mark.className.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 whitespace-nowrap">
                          {mark.className}
                        </p>
                        <span className="text-gray-400 text-[10px]">{mark.classId}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-gray-700 text-theme-sm dark:text-gray-300 whitespace-nowrap">
                    {mark.subject}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {mark.teacher}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-center text-gray-600 text-theme-sm dark:text-gray-300 font-semibold">
                    {mark.studentsCount}
                  </TableCell>
                  <TableCell className={`py-3 px-3 text-center font-bold text-theme-sm ${scoreColor}`}>
                    {mark.avgScore > 0 ? `${mark.avgScore}/100` : "—"}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                        grade === "A1"
                          ? "bg-green-100 text-green-700"
                          : grade === "B2"
                          ? "bg-blue-100 text-blue-700"
                          : grade === "B3"
                          ? "bg-cyan-100 text-cyan-700"
                          : grade === "C4"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {mark.avgScore > 0 ? grade : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <Badge
                      size="sm"
                      color={STATUS_COLOR[mark.status]}
                    >
                      {mark.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-3 text-gray-400 text-theme-xs whitespace-nowrap">
                    {mark.submittedAt}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
