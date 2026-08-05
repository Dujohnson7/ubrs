import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useNavigate } from "react-router";

// Approval stats from approvalData.ts sample data:
// Total subjects across all classes: 16
// Approved: 5, Submitted: 5, Pending: 5, Rejected: 1
const TOTAL = 16;
const APPROVED = 5;
const SUBMITTED = 5;
const PENDING = 5;
const REJECTED = 1;
const PCT = Math.round((APPROVED / TOTAL) * 100);

export default function MonthlyTarget() {
  const navigate = useNavigate();
  const series = [PCT];
  const options: ApexOptions = {
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
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] h-full flex flex-col">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Marks Approval Status
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Term 1 · {APPROVED}/{TOTAL} subjects approved
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-44 p-2">
              <DropdownItem
                onItemClick={() => { setIsOpen(false); navigate("/marks-approval"); }}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View Marks Approval
              </DropdownItem>
              <DropdownItem
                onItemClick={() => setIsOpen(false)}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Export Report
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-[330px]" id="chartApprovalStatus">
            <Chart options={options} series={series} type="radialBar" height={330} />
          </div>
          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
            {APPROVED} approved
          </span>
        </div>

        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {APPROVED} subjects approved out of {TOTAL}. {REJECTED > 0 ? `${REJECTED} subject(s) rejected — please review.` : "Keep up the review pace!"}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        {[
          { label: "Approved", val: APPROVED, color: "#16a34a" },
          { label: "Submitted", val: SUBMITTED, color: "#2563eb" },
          { label: "Pending", val: PENDING, color: "#d97706" },
          { label: "Rejected", val: REJECTED, color: "#dc2626" },
        ].map(({ label, val, color }, i, arr) => (
          <>
            <div key={label}>
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
            {i < arr.length - 1 && (
              <div key={`sep-${label}`} className="w-px bg-gray-200 h-7 dark:bg-gray-800" />
            )}
          </>
        ))}
      </div>
    </div>
  );
}
