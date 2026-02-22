import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

export default function DateRangePicker({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
}) {
  const [open, setOpen] = useState(false);

  // 🔹 Keep DATE OBJECTS internally
  const [range, setRange] = useState({
    from: fromDate ? new Date(fromDate) : undefined,
    to: toDate ? new Date(toDate) : undefined,
  });

  const handleApply = () => {
    if (range?.from) setFromDate(format(range.from, "yyyy-MM-dd"));
    if (range?.to) setToDate(format(range.to, "yyyy-MM-dd"));
    setOpen(false);
  };

  return (
    <>
      {/* 🔵 BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md shadow"
      >
        Select Date Range
      </button>

      {/* 🔵 SELECTED RANGE TEXT */}
      <span className="text-sm text-gray-600 ml-2">
        {fromDate} → {toDate}
      </span>

      {/* 🔵 MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Select Date Range
            </h2>

            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              captionLayout="dropdown"
              fromYear={2020}
              toYear={2035}
              numberOfMonths={2} // ⭐ looks much better
            />

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleApply}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}