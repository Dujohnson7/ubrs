import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState, useMemo, useEffect } from "react";
import { headerTeacherDashboardService, AverageMarksBySubject } from "../../services/headerTeacherDashboardService";

type LevelKey = "all" | "nursery" | "primary";

type LevelSeries = {
  name: string;
  data: number[];
};

const LEVELS: { key: LevelKey; label: string }[] = [
  { key: "all",     label: "All Levels" },
  { key: "nursery", label: "Nursery" },
  { key: "primary", label: "Primary" },
];

export default function MonthlySalesChart() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<LevelKey>("all");
  const [data, setData] = useState<AverageMarksBySubject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await headerTeacherDashboardService.getAverageMarksBySubject();
        setData(result);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to load average marks");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const activeSeries = useMemo(() => {
    if (!data) return [];

    const nurserySeries: LevelSeries = {
      name: data.nursery.name,
      data: data.nursery.averageMarks,
    };

    const primarySeries: LevelSeries = {
      name: data.primary.name,
      data: data.primary.averageMarks,
    };

    if (activeLevel === "all") {
      return [nurserySeries, primarySeries];
    } else if (activeLevel === "nursery") {
      return [nurserySeries];
    } else {
      return [primarySeries];
    }
  }, [data, activeLevel]);

  const options: ApexOptions = {
    colors: ["#a78bfa", "#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      toolbar: { show: false },
      animations: { enabled: true, speed: 350 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: activeLevel === "all" ? "48%" : "30%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: data?.subjects || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: "11px", colors: ["#6B7280"] },
        rotate: -20,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      fontSize: "12px",
    },
    yaxis: {
      title: { text: "Score (/ 100)", style: { fontSize: "12px", color: "#9CA3AF" } },
      max: 100,
      labels: {
        formatter: (v: number) => `${v}`,
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
    },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: true },
      y: { formatter: (val: number) => `${val}/100` },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 h-full flex flex-col">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Average Marks by Subject
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {data ? `${data.term} · ${data.academicYear} · Score out of 100` : 'Loading...'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* ── School-level tab selector ── */}
          <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
            {LEVELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveLevel(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  activeLevel === key
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-theme-xs"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Options menu ── */}
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown isOpen={menuOpen} onClose={() => setMenuOpen(false)} className="w-40 p-2">
              <DropdownItem
                onItemClick={() => setMenuOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Reports
              </DropdownItem>
              <DropdownItem
                onItemClick={() => setMenuOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export PDF
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="max-w-full overflow-x-auto custom-scrollbar mt-2 flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        ) : (
          <div className="-ml-5 min-w-[550px] xl:min-w-full pl-2 h-full">
            <Chart options={options} series={activeSeries} type="bar" height={280} />
          </div>
        )}
      </div>
    </div>
  );
}
