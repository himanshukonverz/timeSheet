import React from 'react'
import { Bar } from 'react-chartjs-2'

function AverageWorkingHours({ employeeNames = [], averageHours = [] }) {
  const chartData = {
    labels: employeeNames,
    datasets: [
      {
        label: 'Average Working Hours',
        data: averageHours,
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgba(245, 158, 11, 1)',
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
        text: 'Average Working Hours of Employees',
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
          text: 'Average Working Hours',
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

export default AverageWorkingHours