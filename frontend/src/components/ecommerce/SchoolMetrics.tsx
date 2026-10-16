import { Link } from "react-router";
import { GroupIcon, BoxIconLine } from "../../icons";
import Badge from "../ui/badge/Badge";
import { HeaderTeacherMetrics } from "../../services/headerTeacherDashboardService";

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

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 7.5V18a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 18V6a2.5 2.5 0 0 1 2.5-2.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 3.5a2.5 2.5 0 0 1 2.5 2.5v1.5H16a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17.5" cy="10.5" r=".75" fill="currentColor" />
    </svg>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

type MetricCard = {
  label: string;
  value: string;
  change?: string;
  color: "success" | "warning" | "error" | "info" | "light";
  bg: string;
  icon: React.ReactNode;
};

function buildCards(m: HeaderTeacherMetrics): MetricCard[] {
  const approvalPct =
    m.marksSubjects > 0 ? Math.round((m.marksApproved / m.marksSubjects) * 100) : 0;

  return [
    {
      label: "Total Students",
      value: String(m.totalStudents),
      change: `N ${m.nurseryStudents} · P ${m.primaryStudents}`,
      color: "success",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      icon: <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />,
    },
    {
      label: "Total Teachers",
      value: String(m.totalTeachers),
      change: `${m.totalClassTeachers} class teachers`,
      color: "success",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      icon: <AcademicCapIcon className="text-indigo-600 size-6 dark:text-indigo-400" />,
    },
    {
      label: "Active Classes",
      value: String(m.totalClasses),
      change: m.activeAcademicYear?.fiscalYear || "—",
      color: "warning",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      icon: <BookIcon className="text-amber-600 size-6 dark:text-amber-400" />,
    },
    {
      label: "Courses",
      value: String(m.totalCourses),
      change: `N ${m.nurseryCourses} · P ${m.primaryCourses}`,
      color: "success",
      bg: "bg-teal-50 dark:bg-teal-900/20",
      icon: <BoxIconLine className="text-teal-600 size-6 dark:text-teal-400" />,
    },
    {
      label: "Marks Approved",
      value: m.marksSubjects > 0 ? `${m.marksApproved} / ${m.marksSubjects}` : "—",
      change: m.marksSubjects > 0 ? `${approvalPct}%` : "No data",
      color: approvalPct >= 70 ? "success" : approvalPct > 0 ? "warning" : "light",
      bg: "bg-green-50 dark:bg-green-900/20",
      icon: <CheckBadgeIcon className="text-green-600 size-6 dark:text-green-400" />,
    },
    {
      label: "Academic Years",
      value: String(m.totalAcademicYears),
      change: m.activeAcademicYear?.fiscalYear || "No active year",
      color: "success",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      icon: <CalendarYearIcon className="text-purple-600 size-6 dark:text-purple-400" />,
    },
  ];
}

type Props = {
  metrics: HeaderTeacherMetrics | null;
  loading?: boolean;
};

export default function SchoolMetrics({ metrics, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
        <div className="col-span-2 sm:col-span-2 lg:col-span-2 h-[130px] animate-pulse rounded-2xl border border-emerald-200/50 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/20" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="col-span-1 h-[130px] animate-pulse rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]"
          />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-800">
        No dashboard metrics available.
      </div>
    );
  }

  const cards = buildCards(metrics);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
      {/* Featured School Balance Card (spans 2 columns on mobile, tablet & desktop) */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-emerald-500/[0.02] to-white dark:to-white/[0.02] p-4 dark:border-emerald-500/30 dark:bg-emerald-950/20 md:p-5 col-span-2 sm:col-span-2 lg:col-span-2 flex flex-col justify-between shadow-xs">
        {/* Top bar with icon, title and quick links */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <WalletIcon className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  School Treasury
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Live Balance
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Net funds available across all accounts
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <Link
              to="/student-fee-payments"
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 hover:bg-emerald-200/70 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/60 transition-colors"
            >
              Student Fees
            </Link>
            <Link
              to="/school-fees"
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-white/[0.06] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/[0.1] transition-colors"
            >
              Fees
            </Link>
            <Link
              to="/school-expenses"
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-white/[0.06] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/[0.1] transition-colors"
            >
              Expenses
            </Link>
            <Link
              to="/expense-payments"
              className="px-2.5 py-1 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-white/[0.06] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/[0.1] transition-colors"
            >
              Payments
            </Link>
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="flex items-end justify-between mt-4 gap-2 pt-3 border-t border-emerald-500/10 dark:border-emerald-500/20">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight block">
              School Balance
            </span>
            <h3 className="mt-1 font-extrabold text-xl sm:text-2xl lg:text-3xl text-gray-900 dark:text-white tabular-nums tracking-tight">
              {formatCurrency(metrics.schoolBalance ?? 0)}
            </h3>
          </div>
          <Badge color="success">Active Treasury</Badge>
        </div>
      </div>

      {/* Other 6 KPI Cards */}
      {cards.map((m) => (
        <div
          key={m.label}
          className="col-span-1 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-5 flex flex-col justify-between"
        >
          <div className={`flex items-center justify-center w-11 h-11 ${m.bg} rounded-xl`}>
            {m.icon}
          </div>
          <div className="flex items-end justify-between mt-4 gap-2">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight block">
                {m.label}
              </span>
              <h4 className="mt-1.5 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {m.value}
              </h4>
            </div>
            {m.change ? <Badge color={m.color}>{m.change}</Badge> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
