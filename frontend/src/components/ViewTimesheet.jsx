import React, { useMemo, useState, useEffect } from "react";
import TimesheetGrid from "../components/TimesheetGrid";
import { useAuth } from "../context/AuthContext";
import EmployeeSearch from "./EmployeeSearch";
import { toast } from "sonner";
import api from "@/api/axios";

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

function ViewTimesheet() {
  const defaultDates = getDefaultDates();
  const [fromDate, setFromDate] = useState(defaultDates.fromDate);
  const [toDate, setToDate] = useState(defaultDates.toDate);
  const [rowData, setRowData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { user } = useAuth();
  const canSearch = user.role === "admin" || user.role === "manager";

  // Fetch data when filters change
  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        let targetEmpId = null;
        if (canSearch && selectedEmployee) {
          targetEmpId = selectedEmployee.empId;
        }

        const params = new URLSearchParams({
          fromDate,
          toDate,
        });

        if(canSearch && selectedEmployee){
          params.append("empId", selectedEmployee.empId)
        }

        const res = await api.get(`/task/employee?${params.toString()}`);

        const normalized = res.data.data.map((task) => ({
          id: task._id,
          taskDate: task.taskDate
            ? new Date(task.taskDate).toISOString().split("T")[0]
            : null,
          project: task.projectId?.projectName || "Unknown",
          projectCategory: task.projectCategory,
          projectStage: task.projectStage,
          taskDescription: task.taskDescription,
          plannedDuration: task.pannedDuration,
          actualDuration: task.actualDuration,
          status: task.status,
        }));

        setRowData(normalized);
      } catch (error) {
        console.log("Failed to fetch timesheet - ", error);
        toast.error("Failed to fetch timesheet data");
      }
    };

    fetchTimesheet();
  }, [fromDate, toDate, selectedEmployee, canSearch]);

  const handleReset = () => {
    const defaults = getDefaultDates();
    setFromDate(defaults.fromDate);
    setToDate(defaults.toDate);
    setSelectedEmployee(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">View Timesheet</h1>

      {/* Date Range Filter */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex flex-wrap items-end gap-4">
          <div
            className={
              canSearch ? "w-[25%] min-w-[150px]" : "flex-1 min-w-[200px]"
            }
          >
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
          <div
            className={
              canSearch ? "w-[25%] min-w-[150px]" : "flex-1 min-w-[200px]"
            }
          >
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
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium mb-1"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <TimesheetGrid rowData={rowData} isEditable={false} />
    </div>
  );
}

export default ViewTimesheet;
