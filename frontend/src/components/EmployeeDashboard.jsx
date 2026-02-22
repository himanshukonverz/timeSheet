import React from "react";
import { AnalyticsCard } from "./AnalyticsCard";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { grid: { display: true, color: "#F1F5F9" }, ticks: { color: "#94A3B8", font: { size: 11 } } },
    x: { grid: { display: false }, ticks: { color: "#94A3B8", font: { size: 11 } } },
  },
};

function EmployeeDashboard({ analytics }) {
  const { cards, charts } = analytics;
  const projectNames = charts.projectEffort.map((p) => p.projectName);
  const hoursData = charts.projectEffort.map((p) => p.hours);
  const totalHoursAll = hoursData.reduce((a, b) => a + b, 0);

  const barChartData = {
    labels: projectNames,
    datasets: [{ label: "Hours", data: hoursData, backgroundColor: "#3B82F6", borderRadius: 6 }],
  };

  const pieChartData = {
    labels: projectNames,
    datasets: [{
      data: hoursData.map((h) => ((h / totalHoursAll) * 100).toFixed(1)),
      backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
      borderWidth: 2,
      borderColor: "#ffffff",
    }],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard title="Total Hours" value={cards.totalHours} icon="🕒" color="blue" />
        <AnalyticsCard title="Active Projects" value={cards.projectsCount} icon="📁" color="indigo" />
        <AnalyticsCard title="Tasks Completed" value={cards.completedTasks} icon="✅" color="emerald" />
        <AnalyticsCard title="Pending Tasks" value={cards.pendingTasks} icon="⏳" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Project Effort (Hours)</h3>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Last 30 Days</span>
          </div>
          <div className="h-[350px]">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Work Distribution</h3>
          <div className="h-[300px] relative flex items-center justify-center">
            <Pie data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;