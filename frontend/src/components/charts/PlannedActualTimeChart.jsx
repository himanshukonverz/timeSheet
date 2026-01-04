import React from 'react'
import { Bar } from 'react-chartjs-2'

function PlannedActualTimeChart({ 
  employeeNames = [], 
  plannedTime = [], 
  actualTime = [] 
}) {
  // Calculate the maximum value from both datasets to set the same scale
  const maxPlanned = Math.max(...plannedTime, 0)
  const maxActual = Math.max(...actualTime, 0)
  const maxValue = Math.max(maxPlanned, maxActual)
  // Add some padding (10% more) for better visualization
  const yAxisMax = maxValue * 1.1

  const chartData = {
    labels: employeeNames,
    datasets: [
      {
        label: 'Planned Time (hours)',
        data: plannedTime,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Actual Time (hours)',
        data: actualTime,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Planned vs Actual Time',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Employee Name',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        max: yAxisMax,
        title: {
          display: true,
          text: 'Planned Time (hours)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        max: yAxisMax,
        title: {
          display: true,
          text: 'Actual Time (hours)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

export default PlannedActualTimeChart