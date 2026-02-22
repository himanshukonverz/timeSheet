import React from "react";
import PlannedActualTimeChart from "./charts/PlannedActualTimeChart";
import ProjectsTimeEffortChart from "./charts/ProjectsTimeEffortChart";
import ProjectTimeEffortPieChart from "./charts/ProjectTimeEffortPieChart";
import AverageWorkingHours from "./charts/AverageWorkingHours";

function AdminDashboard({ analytics }) {
  const {
    avgWorkingHours,
    plannedVsActual,
    projectEfforts,
    projectPercentages,
  } = analytics;

  const employeeNames = avgWorkingHours?.map(e => e.name);
  const averageWorkingHours = avgWorkingHours?.map(e => e.avgHours);

  const plannedTime = plannedVsActual?.map(e => e.plannedHours);
  const actualTime = plannedVsActual?.map(e => e.actualHours);

  const projectNames = projectEfforts?.map(p => p.projectName);
  const projectTimeData = projectEfforts?.map(p => p.hours);

  return (
    <div>
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AverageWorkingHours
          employeeNames={employeeNames}
          averageHours={averageWorkingHours}
        />

        <PlannedActualTimeChart
          employeeNames={employeeNames}
          plannedTime={plannedTime}
          actualTime={actualTime}
        />
      </div>

      {/* Row 2 */}
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
    </div>
  );
}

export default AdminDashboard;