import React from 'react'
import { Pie } from 'react-chartjs-2'

function ProjectTimeEffortPieChart({ projectNames = [], timeData = [] }) {
  const totalTime = timeData.reduce((sum, time) => sum + time, 0)
  
  const chartData = {
    labels: projectNames,
    datasets: [
      {
        label: 'Time Effort %',
        data: timeData.map(time => ((time / totalTime) * 100).toFixed(1)),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Project Time Effort Percentage',
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
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  )
}

export default ProjectTimeEffortPieChart