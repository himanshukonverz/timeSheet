import React, { useEffect, useState } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import { useAuth } from "@/context/AuthContext";
import { getDefaultAnalyticsDates } from "@/utils/dateRange";
import api from "@/api/axios";
import { toast } from "sonner";
import DateRangePicker from "@/components/DatePicker";

export const dummyAdminAnalytics = {
  avgWorkingHours: [
    { name: "Himanshu Rawat", avgHours: 7.8 },
    { name: "Amit Sharma", avgHours: 8.3 },
    { name: "Neha Gupta", avgHours: 7.2 },
    { name: "Rohit Jain", avgHours: 6.9 },
    { name: "Priya Singh", avgHours: 8.1 },
  ],

  plannedVsActual: [
    { name: "Himanshu Rawat", plannedHours: 160, actualHours: 168 },
    { name: "Amit Sharma", plannedHours: 150, actualHours: 145 },
    { name: "Neha Gupta", plannedHours: 155, actualHours: 162 },
    { name: "Rohit Jain", plannedHours: 148, actualHours: 138 },
    { name: "Priya Singh", plannedHours: 158, actualHours: 165 },
  ],

  projectEfforts: [
    { projectName: "Project Alpha", hours: 320 },
    { projectName: "Project Beta", hours: 250 },
    { projectName: "Project Gamma", hours: 180 },
    { projectName: "Project Delta", hours: 140 },
    { projectName: "Project Echo", hours: 95 },
  ],

  projectPercentages: [
    { projectName: "Project Alpha", percentage: 32 },
    { projectName: "Project Beta", percentage: 25 },
    { projectName: "Project Gamma", percentage: 18 },
    { projectName: "Project Delta", percentage: 14 },
    { projectName: "Project Echo", percentage: 11 },
  ],
};

export const dummyEmployeeAnalytics = {
  cards: {
    totalHours: 162,
    projectsCount: 4,
    completedTasks: 38,
    pendingTasks: 6,
  },

  charts: {
    avgWorkingHours: 8.1,

    plannedVsActual: {
      plannedHours: 160,
      actualHours: 162,
    },

    projectEffort: [
      { projectName: "Project Alpha", hours: 62 },
      { projectName: "Project Beta", hours: 40 },
      { projectName: "Project Gamma", hours: 30 },
      { projectName: "Internal", hours: 30 },
    ],

    projectPercentage: [
      { projectName: "Project Alpha", percentage: 38 },
      { projectName: "Project Beta", percentage: 25 },
      { projectName: "Project Gamma", percentage: 18 },
      { projectName: "Internal", percentage: 19 },
    ],
  },
};

function Dashboard() {
  const { user } = useAuth();
  const defaults = getDefaultAnalyticsDates();

  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [fromDate, toDate]);

  const fetchAnalytics = async () => {
    console.log("fetch analytics method entering");
    try {
      setLoading(true);

      const endpoint =
        user?.role === "admin" ? "/analytics/admin" : "/analytics/me";

      const res = await api.get(
        `${endpoint}?fromDate=${fromDate}&toDate=${toDate}`
      );

      console.log("res - ", res);

      setAnalyticsData(res.data.data);
    } catch (err) {
      toast.error("Failed to load dashboard analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const defaults = getDefaultAnalyticsDates();
    setFromDate(defaults.fromDate);
    setToDate(defaults.toDate);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 text-blue-600 font-medium">
      <div className="animate-pulse">Loading dashboard metrics...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-slate-500 text-sm">Here's what's happening with your projects today.</p>
          </div>
          
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
             <DateRangePicker
                fromDate={fromDate}
                toDate={toDate}
                setFromDate={setFromDate}
                setToDate={setToDate}
              />
              <button 
                onClick={handleReset}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Reset
              </button>
          </div>
        </div>

        {/* DASHBOARDS */}
        <div className="transition-all duration-300">
            {user.role === "admin" ? (
              <AdminDashboard analytics={analyticsData || dummyAdminAnalytics} />
            ) : (
              <EmployeeDashboard analytics={analyticsData || dummyEmployeeAnalytics} />
            )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
