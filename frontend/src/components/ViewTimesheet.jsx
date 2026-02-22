import React, { useState, useEffect } from "react";
import TimesheetGrid from "../components/TimesheetGrid";
import { useAuth } from "../context/AuthContext";
import EmployeeSearch from "./EmployeeSearch";
import DateRangePicker from "@/components/DatePicker";
import { toast } from "sonner";
import api from "@/api/axios";

const getDefaultDates = () => {
  const now = new Date();
  return {
    fromDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
    toDate: now.toISOString().split("T")[0],
  };
};

function ViewTimesheet() {
  const { user } = useAuth();
  const canSearch = user.role === "admin" || user.role === "manager";
  const defaults = getDefaultDates();

  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [rowData, setRowData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dropdowns, setDropdowns] = useState({ projects: [], categories: [], stages: [], statuses: [] });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await api.get("/task/metadata");
        setDropdowns(res.data);
      } catch (err) { toast.error("Failed to load metadata"); }
    };
    fetchDropdowns();
  }, []);

  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const params = new URLSearchParams({ fromDate, toDate });
        if (canSearch && selectedEmployee) params.append("empId", selectedEmployee.empId);
        
        const res = await api.get(`/task/employee?${params.toString()}`);
        const normalized = res.data.data.map((task) => ({
          id: task._id,
          taskDate: task.taskDate?.split("T")[0],
          project: task?.projectId?._id,
          projectCategory: task.projectCategory,
          projectStage: task.projectStage,
          taskDescription: task.taskDescription,
          plannedDuration: task.plannedDuration,
          actualDuration: task.actualDuration,
          status: task.status,
        }));
        setRowData(normalized);
      } catch (error) { toast.error("Failed to fetch timesheet data"); }
    };
    fetchTimesheet();
  }, [fromDate, toDate, selectedEmployee, canSearch]);

  const handleReset = () => {
    const d = getDefaultDates();
    setFromDate(d.fromDate);
    setToDate(d.toDate);
    setSelectedEmployee(null);
  };

  if (!dropdowns.projects.length) return <div className="p-8 text-center text-slate-500">Loading Grid...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Timesheet Records</h1>
            <p className="text-slate-500 text-sm">Review and manage time logs across projects.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            {canSearch && (
              <div className="w-64 border-r border-slate-100 pr-3 mr-1">
                <EmployeeSearch onSelect={setSelectedEmployee} />
              </div>
            )}
            <DateRangePicker fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} />
            <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              Reset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <TimesheetGrid rowData={rowData} dropdowns={dropdowns} isEditable={false} />
        </div>
      </div>
    </div>
  );
}

export default ViewTimesheet;