import React, { useEffect, useRef } from 'react'
import AnalyticsCard from './AnalyticsCard'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

function EmployeeDashboard() {
  // Dummy data for charts
  const projectNames = ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Echo']
  const hoursData = [45, 30, 25, 20, 15]
  
  // Bar chart data
  const barChartData = {
    labels: projectNames,
    datasets: [
      {
        label: 'Hours',
        data: hoursData,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  // Pie chart data
  const totalHours = hoursData.reduce((sum, hours) => sum + hours, 0)
  const pieChartData = {
    labels: projectNames,
    datasets: [
      {
        label: 'Time Effort %',
        data: hoursData.map(hours => ((hours / totalHours) * 100).toFixed(1)),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Hours by Project',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Projects',
        },
      },
    },
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Time Effort Distribution (%)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || ''
            if (label) {
              label += ': '
            }
            label += context.parsed + '%'
            return label
          },
        },
      },
    },
  }

  return (
    <div className="p-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AnalyticsCard title="Total Hours" value="120" />
        <AnalyticsCard title="Projects" value="5" />
        <AnalyticsCard title="Tasks Completed" value="42" />
        <AnalyticsCard title="Pending Tasks" value="8" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="h-80">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="h-80">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard