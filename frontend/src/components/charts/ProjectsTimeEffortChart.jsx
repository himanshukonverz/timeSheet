import React from 'react'
import { Bar } from 'react-chartjs-2'

function ProjectsTimeEffortChart({ projectNames = [], timeData = [] }) {
  const chartData = {
    labels: projectNames,
    datasets: [
      {
        label: 'Time Taken (hours)',
        data: timeData,
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
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
        text: 'Projects and Time Efforts',
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
          text: 'Time Taken (hours)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Project Names',
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

export default ProjectsTimeEffortChart