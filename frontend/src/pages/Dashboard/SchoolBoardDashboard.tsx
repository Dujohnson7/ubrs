import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import { useAuth } from "../../hooks/useAuth";

// Academic components: Average Marks by Subject & Grade Distribution
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart"; // Average Marks by Subject
import DemographicCard from "../../components/ecommerce/DemographicCard"; // Grade Distribution
import {
  headerTeacherDashboardService,
  HeaderTeacherMetrics,
} from "../../services/headerTeacherDashboardService";

// Accountant Dashboard services
import {
  accountantDashboardService,
  AccountantDashboardMetrics,
} from "../../services/accountantDashboardService";
import { SCHOOL_BALANCE_UPDATED_EVENT } from "../../services/schoolBalanceService";

// Announcement component
import DashboardAnnouncements from "../../components/dashboard/DashboardAnnouncements";

import {
  DollarLineIcon,
  AlertHexaIcon,
  CalenderIcon,
  GroupIcon,
  PieChartIcon,
  ListIcon,
  DocsIcon,
} from "../../icons";

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 7.5V18a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 18V6a2.5 2.5 0 0 1 2.5-2.5H18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 3.5a2.5 2.5 0 0 1 2.5 2.5v1.5H16a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.5" cy="10.5" r=".75" fill="currentColor" />
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

export default function SchoolBoardDashboard() {
  const { user } = useAuth();

  const [accountantMetrics, setAccountantMetrics] = useState<AccountantDashboardMetrics | null>(null);
  const [headerTeacherMetrics, setHeaderTeacherMetrics] = useState<HeaderTeacherMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const formatCurrency = (amount?: number | null) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [accData, htData] = await Promise.all([
        accountantDashboardService.getDashboardMetrics(),
        headerTeacherDashboardService.getDashboardMetrics(),
      ]);
      setAccountantMetrics(accData);
      setHeaderTeacherMetrics(htData);
    } catch (err) {
      console.error("Failed to load school board dashboard data", err);
      setError("Unable to load board metrics from server. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();

    const handleBalanceChanged = () => {
      void loadData();
    };
    window.addEventListener(SCHOOL_BALANCE_UPDATED_EVENT, handleBalanceChanged);
    return () => {
      window.removeEventListener(SCHOOL_BALANCE_UPDATED_EVENT, handleBalanceChanged);
    };
  }, []);

  const completionRate = useMemo(() => {
    if (!accountantMetrics) return 0;
    if (accountantMetrics.schoolFeeCompletionRate != null && accountantMetrics.schoolFeeCompletionRate > 0) {
      return Math.min(100, Math.round(accountantMetrics.schoolFeeCompletionRate * 10) / 10);
    }
    if (accountantMetrics.totalAmountExpectedByActive > 0) {
      return Math.min(
        100,
        Math.round(
          (accountantMetrics.totalAmountCollectedByActive / accountantMetrics.totalAmountExpectedByActive) * 1000
        ) / 10
      );
    }
    return 0;
  }, [accountantMetrics]);

  // Radial Bar chart for Fee Clearance Rate
  const radialChartOptions: ApexOptions = useMemo(
    () => ({
      colors: ["#10B981"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "radialBar",
        height: 250,
        sparkline: { enabled: true },
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          hollow: { size: "75%" },
          track: {
            background: "#E4E7EC",
            strokeWidth: "100%",
            margin: 5,
          },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: "28px",
              fontWeight: "700",
              offsetY: -30,
              color: "#1D2939",
              formatter: (val) => val + "%",
            },
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "horizontal",
          shadeIntensity: 0.5,
          gradientToColors: ["#059669"],
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
      stroke: { lineCap: "round" },
      labels: ["Completion Rate"],
    }),
    []
  );

  // Financial Breakdown Comparison Bar Chart
  const barChartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 260,
        toolbar: { show: false },
      },
      colors: ["#465FFF", "#10B981", "#F59E0B"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          borderRadius: 6,
          distributed: true,
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: {
        categories: ["Expected Fees", "Total Collected", "Pending Receivable"],
        labels: {
          style: {
            colors: "#64748B",
            fontSize: "12px",
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => `${Math.round(val / 1000).toLocaleString()}k`,
          style: { colors: "#64748B", fontSize: "11px" },
        },
      },
      grid: {
        borderColor: "#F1F5F9",
        strokeDashArray: 4,
      },
      tooltip: {
        y: {
          formatter: (val) => formatCurrency(val),
        },
      },
    }),
    []
  );

  const barChartSeries = useMemo(() => {
    return [
      {
        name: "Amount (RWF)",
        data: [
          accountantMetrics?.totalAmountExpectedByActive || 0,
          accountantMetrics?.totalAmountCollectedByActive || 0,
          accountantMetrics?.totalAmountPendingReceivableByActive || 0,
        ],
      },
    ];
  }, [accountantMetrics]);

  const activeYearLabel =
    accountantMetrics?.activeAcademicYear?.fiscalYear ||
    headerTeacherMetrics?.activeAcademicYear?.fiscalYear ||
    "Current Academic Year";

  return (
    <>
      <PageMeta
        title="Ubrs — School Board Dashboard"
        description="School Board Governance Overview: Financial Solvency, Enrollment & Academic Performance."
      />

      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-emerald-500/10 border border-amber-200/60 dark:border-amber-900/40 dark:bg-gray-900">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/50">
                School Board
              </span>
              <Badge color="success">Active Year: {activeYearLabel}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1.5">
              School Board Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Welcome, {user?.names || "Board Manager"} • Key Governance Metrics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/financial-report">
              <Button size="sm" variant="primary" className="inline-flex items-center gap-1.5 text-xs">
                <PieChartIcon className="w-4 h-4" />
                Financial Report
              </Button>
            </Link>
            <Link to="/school-report">
              <Button size="sm" variant="outline" className="inline-flex items-center gap-1.5 text-xs">
                <AcademicCapIcon className="w-4 h-4" />
                School Report
              </Button>
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* 1. Primary Financial & Student KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* School Balance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                School Balance
              </span>
              <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <WalletIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {loading ? "..." : formatCurrency(accountantMetrics?.schoolBalance ?? headerTeacherMetrics?.schoolBalance)}
            </h4>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Live Available Funds</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Solvent</span>
            </div>
          </div>

          {/* Fee Revenue Collected */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Fee Revenue Collected
              </span>
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <DollarLineIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {loading ? "..." : formatCurrency(accountantMetrics?.totalAmountCollectedByActive)}
            </h4>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">Expected: {formatCurrency(accountantMetrics?.totalAmountExpectedByActive)}</span>
              <span className="font-bold text-blue-600">{completionRate}% settled</span>
            </div>
          </div>

          {/* Outstanding Receivables */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Outstanding Receivables
              </span>
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <AlertHexaIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {loading ? "..." : formatCurrency(accountantMetrics?.totalAmountPendingReceivableByActive)}
            </h4>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Unpaid Tuition Fees</span>
              <span className="font-semibold text-amber-600">Pending</span>
            </div>
          </div>

          {/* Total Students (Primary & Nursery) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Students
              </span>
              <span className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <GroupIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {loading ? "..." : (accountantMetrics?.totalStudents ?? headerTeacherMetrics?.totalStudents ?? 0)}
            </h4>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                Primary: <strong className="text-gray-800 dark:text-gray-200">{headerTeacherMetrics?.primaryStudents ?? accountantMetrics?.primaryStudents ?? 0}</strong> • Nursery:{" "}
                <strong className="text-gray-800 dark:text-gray-200">{headerTeacherMetrics?.nurseryStudents ?? accountantMetrics?.nurseryStudents ?? 0}</strong>
              </span>
            </div>
          </div>


        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Teachers */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Teachers
              </span>
              <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <GroupIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {loading ? "..." : (headerTeacherMetrics?.totalTeachers ?? accountantMetrics?.totalTeachers ?? 0)}
            </h4>
            <p className="mt-2 text-xs text-gray-500">
              Active Teaching Staff • {headerTeacherMetrics?.totalClassTeachers ?? 0} Class Teachers
            </p>
          </div>

          {/* Classes */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Classes
              </span>
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <ListIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {loading ? "..." : (headerTeacherMetrics?.totalClasses ?? 0)}
            </h4> 
          </div>

          {/* Courses */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Courses
              </span>
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <DocsIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
              {loading ? "..." : (headerTeacherMetrics?.totalCourses ?? 0)}
            </h4>
            <p className="mt-2 text-xs text-gray-500">
              Primary: {headerTeacherMetrics?.primaryCourses ?? 0} • Nursery: {headerTeacherMetrics?.nurseryCourses ?? 0}
            </p>
          </div>

          {/* Active Academic Year */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Active Academic Year
              </span>
              <span className="rounded-xl bg-green-50 p-2.5 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                <CalenderIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-xl font-bold text-gray-900 dark:text-white truncate">
              {activeYearLabel}
            </h4> 
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Tuition Revenue & Fee Settlement Breakdown */}
          <div className="lg:col-span-7">
            <ComponentCard
              title="Tuition Revenue & Fee Settlement Breakdown"
              desc={`Active Fiscal Year: ${activeYearLabel}`}
            >
              <div className="pt-2">
                <Chart options={barChartOptions} series={barChartSeries} type="bar" height={260} />
              </div>
            </ComponentCard>
          </div>

          {/* Fee Clearance Rate & Student Standing */}
          <div className="lg:col-span-5">
            <ComponentCard
              title="Fee Clearance Rate & Student Standing"
              desc="Enrolled student payment status for current term"
            >
              <div className="flex flex-col items-center justify-center pt-2">
                <Chart options={radialChartOptions} series={[completionRate]} type="radialBar" height={230} />
                <br /><br />
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3 text-center">
                  <strong>{completionRate}%</strong> of expected fees collected.
                </p>

                {/* Status Breakdown Pills: Paid, Partial, Unpaid */}
                <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                  <div className="p-2.5 rounded-xl bg-green-50/70 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
                    <span className="text-[11px] font-semibold text-green-700 dark:text-green-400 uppercase block">
                      Paid
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-300">
                      {loading ? "..." : accountantMetrics?.totalStudentPaid ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Students</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase block">
                      Partial
                    </span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-300">
                      {loading ? "..." : accountantMetrics?.totalStudentPartial ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Installments</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30">
                    <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase block">
                      Unpaid
                    </span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-300">
                      {loading ? "..." : accountantMetrics?.totalStudentUnpaid ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Pending</span>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Average Marks by Subject */}
          <div className="lg:col-span-7">
            <MonthlySalesChart />
          </div>

          {/* Grade Distribution */}
          <div className="lg:col-span-5">
          <DashboardAnnouncements />
          </div>
        </div>

        {/* 5. School Announcement */}
        <div>
            <DemographicCard />
          {/*<DashboardAnnouncements /> */}
        </div>
      </div>
    </>
  );
}
