import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// Grade distribution data per class level based on sampleApprovalData marks
const gradeData = [
  { level: "Primary 1A", a1: 3, b2: 4, b3: 2, c4: 1, d: 0, total: 10 },
  { level: "Primary 1B", a1: 4, b2: 3, b3: 2, c4: 1, d: 0, total: 10 },
  { level: "Primary 2A", a1: 2, b2: 5, b3: 2, c4: 1, d: 0, total: 10 },
  { level: "Nursery A",  a1: 3, b2: 1, b3: 0, c4: 0, d: 0, total: 4  },
];

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);

  const series = [
    { name: "A1 (≥80)", data: gradeData.map((d) => d.a1) },
    { name: "B2 (70–79)", data: gradeData.map((d) => d.b2) },
    { name: "B3 (60–69)", data: gradeData.map((d) => d.b3) },
    { name: "C4 (50–59)", data: gradeData.map((d) => d.c4) },
    { name: "D (<50)", data: gradeData.map((d) => d.d) },
  ];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      stacked: true,
      toolbar: { show: false },
    },
    colors: ["#22c55e", "#3b82f6", "#06b6d4", "#f59e0b", "#ef4444"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 3,
        borderRadiusApplication: "end",
        columnWidth: "60%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: gradeData.map((d) => d.level),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "11px", colors: ["#6B7280"] } },
    },
    yaxis: {
      labels: { style: { fontSize: "11px", colors: ["#6B7280"] } },
    },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit",
      fontSize: "11px",
    },
    fill: { opacity: 1 },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    tooltip: {
      y: { formatter: (val: number) => `${val} students` },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Grade Distribution
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of students per grade by class
          </p>
        </div>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem
              onItemClick={() => setIsOpen(false)}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View Reports
            </DropdownItem>
            <DropdownItem
              onItemClick={() => setIsOpen(false)}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Export PDF
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[300px]">
          <Chart options={options} series={series} type="bar" height={220} />
        </div>
      </div>

      {/* Legend summary */}
      <div className="mt-4 space-y-2">
        {gradeData.map((d) => {
          const pctA1 = Math.round((d.a1 / d.total) * 100);
          return (
            <div key={d.level} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#2563eb]" />
                <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                  {d.level}
                </span>
              </div>
              <div className="flex w-full max-w-[160px] items-center gap-2">
                <div className="relative block h-2 w-full max-w-[110px] rounded-sm bg-gray-200 dark:bg-gray-800">
                  <div
                    className="absolute left-0 top-0 h-full rounded-sm bg-brand-500"
                    style={{ width: `${pctA1}%` }}
                  />
                </div>
                <p className="font-medium text-gray-700 text-theme-xs dark:text-white/80 whitespace-nowrap">
                  {d.a1}/{d.total} A1
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
