import { GroupIcon, BoxIconLine } from "../../icons";
import Badge from "../ui/badge/Badge";

// School-specific SVG icons as inline components
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AcademicCapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17c3.333 1.667 6.667 2.5 10 2.5S18.667 18.667 22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12c3.333 1.667 6.667 2.5 10 2.5S18.667 13.667 22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckBadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarYearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// KPI data — reflects what the localhost:3300 dashboard shows
const metrics = [
  {
    label: "Total Students",
    value: "145",
    color: "success" as const,
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />,
  },
  {
    label: "Total Teachers",
    value: "5", 
    color: "success" as const,
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    icon: <AcademicCapIcon className="text-indigo-600 size-6 dark:text-indigo-400" />,
  },
  {
    label: "Active Classes",
    value: "5",
    change: "Term 1",
    color: "warning" as const,
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: <BookIcon className="text-amber-600 size-6 dark:text-amber-400" />,
  },
  {
    label: "Courses",
    value: "12", 
    color: "success" as const,
    bg: "bg-teal-50 dark:bg-teal-900/20",
    icon: <BoxIconLine className="text-teal-600 size-6 dark:text-teal-400" />,
  },
  {
    label: "Marks Approved",
    value: "5 / 16",
    change: "31%",
    color: "warning" as const,
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: <CheckBadgeIcon className="text-green-600 size-6 dark:text-green-400" />,
  },
  {
    label: "Academic Years",
    value: "3",
    change: "2025–2026",
    color: "success" as const,
    bg: "bg-purple-50 dark:bg-purple-900/20",
    icon: <CalendarYearIcon className="text-purple-600 size-6 dark:text-purple-400" />,
  },
];

export default function SchoolMetrics() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-5"
        >
          <div className={`flex items-center justify-center w-11 h-11 ${m.bg} rounded-xl`}>
            {m.icon}
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight block">
                {m.label}
              </span>
              <h4 className="mt-1.5 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {m.value}
              </h4>
            </div>
            <Badge color={m.color}> 
              {m.change}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
