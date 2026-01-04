import React from "react";
import LeavesPerEmployeeChart from "./charts/LeavesPerEmployeeChart";
import PlannedActualTimeChart from "./charts/PlannedActualTimeChart";
import ProjectsTimeEffortChart from "./charts/ProjectsTimeEffortChart";
import ProjectTimeEffortPieChart from "./charts/ProjectTimeEffortPieChart";
import AverageWorkingHours from "./charts/AverageWorkingHours";

function AdminDashboard() {
  // Dummy data for Leaves per Employee
  const employeeNames = [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Williams",
    "David Brown",
  ];
  const leavesData = [5, 8, 3, 6, 4];

  // Dummy data for Planned vs Actual Time
  const plannedTime = [40, 35, 45, 30, 38];
  const actualTime = [42, 33, 48, 28, 40];

  // Dummy data for Projects Time Effort
  const projectNames = [
    "Project Alpha",
    "Project Beta",
    "Project Gamma",
    "Project Delta",
    "Project Echo",
  ];
  const projectTimeData = [120, 95, 80, 65, 50];

  // Dummy data for Average Working Hours
  const averageWorkingHours = [7.5, 8.2, 6.8, 7.9, 8.0];

  return (
    <div className="p-6">
      {/* First Row: Leaves per Employee and Planned vs Actual Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LeavesPerEmployeeChart
          employeeNames={employeeNames}
          leavesData={leavesData}
        />
        <AverageWorkingHours
          employeeNames={employeeNames}
          averageHours={averageWorkingHours}
        />
      </div>

      {/* Second Row: Projects Time Effort Bar Chart and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectsTimeEffortChart
          projectNames={projectNames}
          timeData={projectTimeData}
        />
        <ProjectTimeEffortPieChart
          projectNames={projectNames}
          timeData={projectTimeData}
        />
      </div>

      {/* Third Row: Average Working Hours */}
      <div className="my-6">
        <PlannedActualTimeChart
          employeeNames={employeeNames}
          plannedTime={plannedTime}
          actualTime={actualTime}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
