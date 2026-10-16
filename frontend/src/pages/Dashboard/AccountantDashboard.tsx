import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import ComponentCard from "../../components/common/ComponentCard";
import { useAuth } from "../../hooks/useAuth";
import {
  accountantDashboardService,
  AccountantDashboardMetrics,
} from "../../services/accountantDashboardService";
import { SCHOOL_BALANCE_UPDATED_EVENT } from "../../services/schoolBalanceService";
import {
  DollarLineIcon,
  CheckCircleIcon,
  AlertHexaIcon,
  CalenderIcon,
  GroupIcon,
  TaskIcon,
  PieChartIcon,
  BoxIconLine,
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

export default function AccountantDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AccountantDashboardMetrics | null>(null);
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
      const data = await accountantDashboardService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load accountant dashboard metrics", err);
      setError("Unable to load accountant dashboard metrics from server.");
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
    if (!metrics) return 0;
    if (metrics.schoolFeeCompletionRate != null && metrics.schoolFeeCompletionRate > 0) {
      return Math.min(100, Math.round(metrics.schoolFeeCompletionRate * 10) / 10);
    }
    if (metrics.totalAmountExpectedByActive > 0) {
      return Math.min(
        100,
        Math.round(
          (metrics.totalAmountCollectedByActive / metrics.totalAmountExpectedByActive) * 1000
        ) / 10
      );
    }
    return 0;
  }, [metrics]);

  // Radial Bar chart for Fee Completion Rate
  const radialChartOptions: ApexOptions = useMemo(
    () => ({
      colors: ["#10B981"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "radialBar",
        height: 280,
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
              fontSize: "30px",
              fontWeight: "700",
              offsetY: -35,
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
          metrics?.totalAmountExpectedByActive || 0,
          metrics?.totalAmountCollectedByActive || 0,
          metrics?.totalAmountPendingReceivableByActive || 0,
        ],
      },
    ];
  }, [metrics]);

  return (
    <>
      <PageMeta
        title="Ubrs — Accountant Dashboard"
        description="Comprehensive overview of school fee collections, pending receivables, and school balance."
      />

      <div className="space-y-6">
        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Accountant Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome back, {user?.names || "Accountant"} • Live Financial & School Fees Overview
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/student-fee-payments">
              <Button size="sm" variant="outline" className="inline-flex items-center gap-1.5">
                <DollarLineIcon className="w-4 h-4" />
                Fee Payments
              </Button>
            </Link>
            <Link to="/school-expenses">
              <Button size="sm" variant="outline" className="inline-flex items-center gap-1.5">
                <BoxIconLine className="w-4 h-4" />
                Expenses
              </Button>
            </Link>
            <Link to="/financial-report">
              <Button size="sm" variant="primary" className="inline-flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4" />
                Financial Report
              </Button>
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Top Financial KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active School Balance */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                School Balance
              </span>
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <WalletIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : formatCurrency(metrics?.schoolBalance)}
            </h4>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Live Available Funds</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">Active</span>
            </div>
          </div>

          {/* Total Collected */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Collected
              </span>
              <span className="rounded-xl bg-green-50 p-2.5 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                <DollarLineIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-green-600 dark:text-green-400">
              {loading ? "..." : formatCurrency(metrics?.totalAmountCollectedByActive)}
            </h4>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">Current Academic Year</span>
              <span className="font-semibold text-green-600">{completionRate}% settled</span>
            </div>
          </div>

          {/* Pending Receivable */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Pending Receivable
              </span>
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <AlertHexaIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {loading ? "..." : formatCurrency(metrics?.totalAmountPendingReceivableByActive)}
            </h4>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Outstanding Balances</span>
              <span className="font-semibold text-amber-600">Pending</span>
            </div>
          </div>

          {/* Expected Revenue */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Expected Total Fees
              </span>
              <span className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                <TaskIcon className="w-5 h-5" />
              </span>
            </div>
            <h4 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : formatCurrency(metrics?.totalAmountExpectedByActive)}
            </h4>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                {metrics?.activeAcademicYear?.fiscalYear || "Active Year"}
              </span>
              <Badge color="info">Target</Badge>
            </div>
          </div>
        </div>

        {/* Charts & Collection Progress Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Revenue Bar Comparison Chart */}
          <div className="lg:col-span-7">
            <ComponentCard
              title="Fee Revenue & Collection Breakdown"
              desc={`Active Fiscal Year: ${metrics?.activeAcademicYear?.fiscalYear || "Current Year"}`}
            >
              <div className="pt-2">
                <Chart
                  options={barChartOptions}
                  series={barChartSeries}
                  type="bar"
                  height={270}
                />
              </div>
            </ComponentCard>
          </div>

          {/* Fee Settlement Gauge & Student Status */}
          <div className="lg:col-span-5">
            <ComponentCard
              title="Term 1 Fee Clearance Rate"
              desc="Settlement progress across enrolled students"
            >
              <div className="flex flex-col items-center justify-center pt-2">
                <Chart
                  options={radialChartOptions}
                  series={[completionRate]}
                  type="radialBar"
                  height={240}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4 text-center">
                  {completionRate}% of expected school fees have been paid for Term 1.
                </p>

                {/* Status Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 w-full mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                  <div className="p-2.5 rounded-xl bg-green-50/70 dark:bg-green-950/30 border border-green-100 dark:border-green-900/30">
                    <span className="text-[11px] font-semibold text-green-700 dark:text-green-400 uppercase block">
                      Paid
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-300">
                      {loading ? "..." : metrics?.totalStudentPaid ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Students</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30">
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase block">
                      Partial
                    </span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-300">
                      {loading ? "..." : metrics?.totalStudentPartial ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Students</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30">
                    <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 uppercase block">
                      Unpaid
                    </span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-300">
                      {loading ? "..." : metrics?.totalStudentUnpaid ?? 0}
                    </span>
                    <span className="text-[10px] text-gray-500 block">Students</span>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        </div>

        {/* Population & Operational Expenses Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Population */}
          <ComponentCard title="Student Population">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Total Students
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : metrics?.totalStudents ?? 0}
                </span>
              </div>

              {/* Primary vs Nursery Breakdown */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Primary School</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {metrics?.primaryStudents ?? 0} students
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full"
                      style={{
                        width: `${
                          metrics?.totalStudents
                            ? ((metrics.primaryStudents || 0) / metrics.totalStudents) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Nursery School</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {metrics?.nurseryStudents ?? 0} students
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${
                          metrics?.totalStudents
                            ? ((metrics.nurseryStudents || 0) / metrics.totalStudents) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ComponentCard>

          {/* Academic & Staff Information */}
          <ComponentCard title="Staff & Academic Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40">
                    <CalenderIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Active Academic Year</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {metrics?.activeAcademicYear?.fiscalYear || "—"}
                    </span>
                  </div>
                </div>
                <Badge color="success">
                  {metrics?.activeAcademicYear?.academicYearStatus || "ACTIVE"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                    <GroupIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Total Teachers</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {metrics?.totalTeachers ?? 0} Staff Members
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ComponentCard>

          {/* School Expenses Overview */}
          <ComponentCard title="Operational Expenses">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40">
                    <BoxIconLine className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Active Expenses</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {metrics?.totalSchoolExpense ?? 0}
                    </span>
                  </div>
                </div>
                <Link to="/school-expenses">
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                Track and register school supplies, operations, and maintenance payments.
              </p>
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
