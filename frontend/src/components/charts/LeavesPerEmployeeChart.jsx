import React from 'react'
import { Bar } from 'react-chartjs-2'

function LeavesPerEmployeeChart({ employeeNames = [], leavesData = [] }) {
  const chartData = {
    labels: employeeNames,
    datasets: [
      {
        label: 'Number of Leaves',
        data: leavesData,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Leaves per Employee',
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
          text: 'Number of Leaves',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Employee Name',
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

export default LeavesPerEmployeeChart