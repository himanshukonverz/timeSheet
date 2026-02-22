import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import mongoose from "mongoose";

// Admin
const getWorkingDays = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

const baseMatch = (fromDate, toDate) => ({
  isDeleted: false,
  status: { $ne: "cancelled" },
  projectStage: { $nin: ["half-day-leave", "full-day-leave", "week-off"] },
  taskDate: { $gte: new Date(fromDate), $lte: new Date(toDate) },
});

export const calculateLeavesPerEmployee = async (fromDate, toDate) => {};

export const calculateAvgWorkingHoursOfEmployees = async (fromDate, toDate) => {
  const workingDays = getWorkingDays(fromDate, toDate);

  const data = await Task.aggregate([
    { $match: baseMatch(fromDate, toDate) },
    {
      $group: {
        _id: "$user",
        totalMinutes: { $sum: "$actualDuration" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        avgHours: {
          $round: [
            { $divide: [{ $divide: ["$totalMinutes", 60] }, workingDays] },
            2,
          ],
        },
      },
    },
  ]);

  return data;
};

export const calculatePlannedVsActualTimeOfEmployees = async (
  fromDate,
  toDate
) => {
  return await Task.aggregate([
    { $match: baseMatch(fromDate, toDate) },
    {
      $group: {
        _id: "$user",
        planned: { $sum: "$plannedDuration" },
        actual: { $sum: "$actualDuration" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        plannedHours: { $round: [{ $divide: ["$planned", 60] }, 2] },
        actualHours: { $round: [{ $divide: ["$actual", 60] }, 2] },
      },
    },
  ]);
};

export const calculateProjectLevelTimeEfforts = async (fromDate, toDate) => {
  return await Task.aggregate([
    { $match: baseMatch(fromDate, toDate) },
    {
      $group: {
        _id: "$projectId",
        totalMinutes: { $sum: "$actualDuration" },
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project",
      },
    },
    { $unwind: "$project" },
    {
      $project: {
        projectName: "$project.projectName",
        hours: { $round: [{ $divide: ["$totalMinutes", 60] }, 2] },
      },
    },
  ]);
};

export const calculateProjectTimePercentage = async (fromDate, toDate) => {
  const data = await Task.aggregate([
    { $match: baseMatch(fromDate, toDate) },
    {
      $group: {
        _id: "$projectId",
        totalMinutes: { $sum: "$actualDuration" },
      },
    },
  ]);

  const totalMinutes = data.reduce((sum, p) => sum + p.totalMinutes, 0);

  const projects = await Project.find();

  return data.map((p) => {
    const project = projects.find(
      (pr) => pr._id.toString() === p._id.toString()
    );
    return {
      projectName: project?.projectName,
      percentage: ((p.totalMinutes / totalMinutes) * 100).toFixed(1),
    };
  });
};

// Employee
const myBaseMatch = (userId, fromDate, toDate) => ({
  user: new mongoose.Types.ObjectId(userId),
  isDeleted: false,
  status: { $ne: "cancelled" },
  projectStage: { $nin: ["half-day-leave", "full-day-leave", "week-off"] },
  taskDate: { $gte: new Date(fromDate), $lte: new Date(toDate) },
});

export const calculateMyTotalHours = async (userId, fromDate, toDate) => {
  const res = await Task.aggregate([
    { $match: myBaseMatch(userId, fromDate, toDate) },
    { $group: { _id: null, totalMinutes: { $sum: "$actualDuration" } } },
  ]);

  return res[0] ? (res[0].totalMinutes / 60).toFixed(2) : 0;
};

export const calculateMyProjectsCount = async (userId, fromDate, toDate) => {
  const res = await Task.aggregate([
    { $match: myBaseMatch(userId, fromDate, toDate) },
    { $group: { _id: "$projectId" } },
    { $count: "count" },
  ]);

  return res[0]?.count || 0;
};

export const calculateMyTaskStats = async (userId, fromDate, toDate) => {
  const data = await Task.aggregate([
    { $match: myBaseMatch(userId, fromDate, toDate) },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  let completed = 0;
  let pending = 0;

  data.forEach((d) => {
    if (d._id === "completed") completed = d.count;
    if (d._id === "in_progress") pending = d.count;
  });

  return { completed, pending };
};

export const calculateMyLeaves = async (userId, fromDate, toDate) => {};

export const calculateMyAvgWorkingHours = async (userId, fromDate, toDate) => {
  const workingDays = getWorkingDays(fromDate, toDate);

  const res = await Task.aggregate([
    { $match: myBaseMatch(userId, fromDate, toDate) },
    { $group: { _id: null, totalMinutes: { $sum: "$actualDuration" } } },
  ]);

  const totalHours = res[0] ? res[0].totalMinutes / 60 : 0;
  return (totalHours / workingDays).toFixed(2);
};

export const calculateMyPlannedVsActual = async (userId, fromDate, toDate) => {
  const res = await Task.aggregate([
    { $match: myBaseMatch(userId, fromDate, toDate) },
    {
      $group: {
        _id: null,
        planned: { $sum: "$plannedDuration" },
        actual: { $sum: "$actualDuration" },
      },
    },
  ]);

  return {
    plannedHours: ((res[0]?.planned || 0) / 60).toFixed(2),
    actualHours: ((res[0]?.actual || 0) / 60).toFixed(2),
  };
};

export const calculateMyProjectEffort = async (userId, fromDate, toDate) => {
  return await Task.aggregate([
    { $match: myBaseMatch(userId, fromDate, toDate) },
    {
      $group: {
        _id: "$projectId",
        totalMinutes: { $sum: "$actualDuration" },
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project",
      },
    },
    { $unwind: "$project" },
    {
      $project: {
        projectName: "$project.projectName",
        hours: { $round: [{ $divide: ["$totalMinutes", 60] }, 2] },
      },
    },
  ]);
};

export const calculateMyProjectEffortPercentage = async (
  userId,
  fromDate,
  toDate
) => {
  const data = await Task.aggregate([
    { $match: myBaseMatch(userId, fromDate, toDate) },
    {
      $group: {
        _id: "$projectId",
        totalMinutes: { $sum: "$actualDuration" },
      },
    },
  ]);

  const totalMinutes = data.reduce((sum, p) => sum + p.totalMinutes, 0);
  const projects = await Project.find();

  return data.map((p) => {
    const project = projects.find(
      (pr) => pr._id.toString() === p._id.toString()
    );
    return {
      projectName: project?.projectName,
      percentage: ((p.totalMinutes / totalMinutes) * 100).toFixed(1),
    };
  });
};
