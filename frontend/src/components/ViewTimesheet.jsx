import React, { useMemo, useState } from "react";
import TimesheetGrid from "../components/TimesheetGrid";
import { useAuth } from "../context/AuthContext";
import EmployeeSearch from "./EmployeeSearch";

// Helper function to get default dates
const getDefaultDates = () => {
  const now = new Date();

  // toDate: current date of current month
  const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const toDateString = toDate.toISOString().split("T")[0];

  // fromDate: 26th of previous month
  const fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 26);
  const fromDateString = fromDate.toISOString().split("T")[0];

  return { fromDate: fromDateString, toDate: toDateString };
};

// Dummy data - replace with API call later
const dummyRowData = [
  {
    id: "1",
    taskDate: "2026-01-02",
    projectName: "Project Alpha",
    projectCategory: "implementation",
    projectStage: "BPU",
    taskDescription: "API integration work",
    plannedDuration: 180,
    actualDuration: 200,
    status: "completed",
  },
  {
    id: "2",
    taskDate: "2026-01-02",
    projectName: "Project Beta",
    projectCategory: "AMS",
    projectStage: "Prod Support",
    taskDescription: "Bug fixes",
    plannedDuration: 120,
    actualDuration: 90,
    status: "in_progress",
  },
  {
    id: "3",
    taskDate: "2026-01-03",
    projectName: "Project Gamma",
    projectCategory: "implementation",
    projectStage: "CRP",
    taskDescription: "Feature development",
    plannedDuration: 240,
    actualDuration: 250,
    status: "completed",
  },
];

function ViewTimesheet() {
  const defaultDates = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaultDates.fromDate);
  const [toDate, setToDate] = useState(defaultDates.toDate);
  const [rowData, setRowData] = useState(dummyRowData);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { user } = useAuth();
  const canSearch = user.role === "admin" || user.role === "manager";

  // Filter rowData based on date range
  const filteredRowData = useMemo(() => {
    if (!fromDate && !toDate) {
      return rowData;
    }

    return rowData.filter((row) => {
      if (!row.taskDate) return false;

      const taskDate = new Date(row.taskDate);
      taskDate.setHours(0, 0, 0, 0);
      const from = fromDate ? new Date(fromDate) : null;
      if (from) {
        from.setHours(0, 0, 0, 0);
      }
      const to = toDate ? new Date(toDate) : null;
      if (to) {
        to.setHours(23, 59, 59, 999);
      }

      if (from && to) {
        return taskDate >= from && taskDate <= to;
      } else if (from) {
        return taskDate >= from;
      } else if (to) {
        return taskDate <= to;
      }
      return true;
    });
  }, [fromDate, toDate, rowData]);

  const handleReset = () => {
    const defaults = getDefaultDates();
    setFromDate(defaults.fromDate);
    setToDate(defaults.toDate);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">View Timesheet</h1>

      {/* Date Range Filter */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex flex-wrap items-end gap-4">
          <div className={canSearch ? "w-[25%] min-w-[150px]" : "flex-1 min-w-[200px]"}>
            <label
              htmlFor="fromDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              From Date
            </label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className={canSearch ? "w-[25%] min-w-[150px]" : "flex-1 min-w-[200px]"}>
            <label
              htmlFor="toDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              To Date
            </label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {canSearch && (
            <div className="w-[45%] min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employee
              </label>
              <EmployeeSearch
                onSelect={(user) => {
                  setSelectedEmployee(user);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <TimesheetGrid rowData={filteredRowData} isEditable={false} />
    </div>
  );
}

export default ViewTimesheet;