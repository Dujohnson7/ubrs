import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useMemo, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useNavigate } from "react-router";
import { HeaderTeacherMetrics } from "../../services/headerTeacherDashboardService";

type Props = {
  metrics: HeaderTeacherMetrics | null;
  loading?: boolean;
};

export default function MonthlyTarget({ metrics, loading }: Props) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const total = metrics?.marksSubjects ?? 0;
  const approved = metrics?.marksApproved ?? 0;
  const submitted = metrics?.marksSubmitted ?? 0;
  const pending = metrics?.marksPending ?? 0;
  const rejected = metrics?.marksRejected ?? 0;
  const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const yearLabel = metrics?.activeAcademicYear?.fiscalYear || "Active year";

  const options: ApexOptions = useMemo(
    () => ({
      colors: ["#465FFF"],
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "radialBar",
        height: 330,
        sparkline: { enabled: true },
      },
      plotOptions: {
        radialBar: {
          startAngle: -85,
          endAngle: 85,
          hollow: { size: "80%" },
          track: {
            background: "#E4E7EC",
            strokeWidth: "100%",
            margin: 5,
          },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: "36px",
              fontWeight: "600",
              offsetY: -40,
              color: "#1D2939",
              formatter: (val) => val + "%",
            },
          },
        },
      },
      fill: { type: "solid", colors: ["#465FFF"] },
      stroke: { lineCap: "round" },
      labels: ["Approved"],
    }),
    []
  );

  const series = [pct];

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] h-full flex flex-col">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Marks Approval Status
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              {loading
                ? "Loading…"
                : `${yearLabel} · ${approved}/${total || 0} subjects approved`}
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-44 p-2">
              <DropdownItem
                onItemClick={() => {
                  setIsOpen(false);
                  navigate("/marks-approval");
                }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Marks Approval
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]" id="chartApprovalStatus">
            <Chart options={options} series={series} type="radialBar" height={330} />
          </div>
          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {approved} approved
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {loading
            ? "Loading approval stats…"
            : total === 0
              ? "No subject approval records yet."
              : `${approved} subjects approved out of ${total}. ${
                  rejected > 0
                    ? `${rejected} subject(s) rejected — please review.`
                    : "Keep up the review pace!"
                }`}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        {[
          { label: "Approved", val: approved, color: "#16a34a" },
          { label: "Submitted", val: submitted, color: "#2563eb" },
          { label: "Pending", val: pending, color: "#d97706" },
          { label: "Rejected", val: rejected, color: "#dc2626" },
        ].map(({ label, val, color }, i, arr) => (
          <div key={label} className="flex items-center gap-5 sm:gap-8">
            <div>
              <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
                {label}
              </p>
              <p
                className="flex items-center justify-center gap-1 text-base font-semibold sm:text-lg"
                style={{ color }}
              >
                {val}
              </p>
            </div>
            {i < arr.length - 1 ? (
              <div className="w-px bg-gray-200 h-7 dark:bg-gray-800" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
