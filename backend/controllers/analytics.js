import {
  calculateAvgWorkingHoursOfEmployees,
  calculateMyAvgWorkingHours,
  calculateMyPlannedVsActual,
  calculateMyProjectEffort,
  calculateMyProjectEffortPercentage,
  calculateMyProjectsCount,
  calculateMyTaskStats,
  calculateMyTotalHours,
  calculatePlannedVsActualTimeOfEmployees,
  calculateProjectLevelTimeEfforts,
  calculateProjectTimePercentage,
} from "../utils/analytics.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.query;

  const [avgWorkingHours, plannedVsActual, projectEfforts, projectPercentages] =
    await Promise.all([
      calculateAvgWorkingHoursOfEmployees(fromDate, toDate),
      calculatePlannedVsActualTimeOfEmployees(fromDate, toDate),
      calculateProjectLevelTimeEfforts(fromDate, toDate),
      calculateProjectTimePercentage(fromDate, toDate),
    ]);

  res.json({
    success: true,
    data: {
      avgWorkingHours,
      plannedVsActual,
      projectEfforts,
      projectPercentages,
    },
  });
});

export const getMyAnalytics = asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.query;
  const userId = req.user.id;

  const [
    totalHours,
    projectsCount,
    taskStats,
    avgWorkingHours,
    plannedVsActual,
    projectEffort,
    projectPercentage,
  ] = await Promise.all([
    calculateMyTotalHours(userId, fromDate, toDate),
    calculateMyProjectsCount(userId, fromDate, toDate),
    calculateMyTaskStats(userId, fromDate, toDate),
    calculateMyAvgWorkingHours(userId, fromDate, toDate),
    calculateMyPlannedVsActual(userId, fromDate, toDate),
    calculateMyProjectEffort(userId, fromDate, toDate),
    calculateMyProjectEffortPercentage(userId, fromDate, toDate),
  ]);

  res.json({
    success: true,
    data: {
      cards: {
        totalHours,
        projectsCount,
        completedTasks: taskStats.completed,
        pendingTasks: taskStats.pending,
      },
      charts: {
        avgWorkingHours,
        plannedVsActual,
        projectEffort,
        projectPercentage,
      },
    },
  });
});
