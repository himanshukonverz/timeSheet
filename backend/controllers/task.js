import asyncHandler from "../utils/asyncHandler.js";
import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import Project from "../models/project.model.js";

// Get All task
export const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    isDeleted: false,
  })
    .populate("user", "name email empId")
    .populate("projectId", "projectName")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

// get task of a specific user
export const getEmployeeTasks = asyncHandler(async (req, res) => {
  const requester = req.user;
  let targetUserId;

  // -------------------------
  // 🔐 Authorization logic
  // -------------------------
  if (req.query.empId) {
    const employee = await User.findOne({ empId: req.query.empId });

    if (!employee) {
      throw new ErrorHandler(404, "Employee not found");
    }

    if (
      !["admin", "manager"].includes(requester.role) &&
      employee._id.toString() !== requester.id.toString()
    ) {
      throw new ErrorHandler(
        403,
        "You are not allowed to view other users' tasks"
      );
    }

    targetUserId = employee._id;
  } else {
    targetUserId = requester.id;
  }

  // -------------------------
  // 📅 Date filtering logic
  // -------------------------
  const { fromDate, toDate } = req.query;

  let startDate;
  let endDate;

  if (fromDate && toDate) {
    startDate = new Date(fromDate);
    endDate = new Date(toDate);

    // Include full toDate till end of day
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Default: last 15 days including today
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    startDate = new Date();
    startDate.setDate(endDate.getDate() - 14); // today + previous 14 days
    startDate.setHours(0, 0, 0, 0);
  }

  // -------------------------
  // 🧠 Query construction
  // -------------------------
  const tasks = await Task.find({
    user: targetUserId,
    isDeleted: false,
    taskDate: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate("projectId", "projectName")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    meta: {
      fromDate: startDate,
      toDate: endDate,
    },
    count: tasks.length,
    data: tasks,
  });
});

// create a task
export const createTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new ErrorHandler(400, "Tasks array is required");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const past15Days = new Date(today);
  past15Days.setDate(today.getDate() - 14);

  // 🔹 Collect projectIds (no N queries)
  const projectIds = [...new Set(tasks.map(t => t.project))];

  const projects = await Project.find(
    { _id: { $in: projectIds } },
    { _id: 1 }
  );

  const projectMap = new Map(projects.map(p => [p._id.toString(), p]));

  const bulkDocs = [];
  const errors = [];

  for (const [index, task] of tasks.entries()) {
    const {
      project,
      projectCategory,
      projectStage,
      taskDescription,
      plannedDuration,
      actualDuration,
      status,
      taskDate,
    } = task;

    // Required fields
    if (
      !project ||
      !projectCategory ||
      !projectStage ||
      !taskDescription ||
      plannedDuration === undefined ||
      !status ||
      !taskDate
    ) {
      errors.push({ index, error: "Missing required fields" });
      continue;
    }

    const parsedDate = new Date(taskDate);
    parsedDate.setHours(0, 0, 0, 0);

    if (isNaN(parsedDate.getTime())) {
      errors.push({ index, error: "Invalid taskDate" });
      continue;
    }

    // ⛔ No future dates
    if (parsedDate > today || parsedDate < past15Days) {
      errors.push({
        index,
        error: "Task date must be within last 15 days (no future dates)",
      });
      continue;
    }

    const projectDoc = projectMap.get(project);

    if (!projectDoc) {
      errors.push({ index, error: "Invalid project" });
      continue;
    }

    bulkDocs.push({
      user: req.user.id,
      projectId: project,
      taskDate: parsedDate,
      projectCategory,
      projectStage,
      taskDescription: taskDescription.trim(),
      plannedDuration,
      actualDuration: actualDuration || 0,
      status,
    });
  }

  if (bulkDocs.length > 0) {
    await Task.insertMany(bulkDocs);
  }

  res.status(201).json({
    success: true,
    createdCount: bulkDocs.length,
    failedCount: errors.length,
    errors,
  });
});

// update a task
export const updateTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new ErrorHandler(400, "Tasks array is required");
  }

  // -----------------------------
  // Date window (last 15 days)
  // -----------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const past15Days = new Date(today);
  past15Days.setDate(today.getDate() - 14);

  // -----------------------------
  // Collect IDs
  // -----------------------------
  const taskIds = tasks.map(t => t.taskId).filter(Boolean);

  const projectIds = [
    ...new Set(tasks.map(t => t.project).filter(Boolean)),
  ];

  // -----------------------------
  // Fetch data in parallel
  // -----------------------------
  const [dbTasks, validProjects] = await Promise.all([
    Task.find({ _id: { $in: taskIds } }),
    Project.find({ _id: { $in: projectIds } }).select("_id"),
  ]);

  const taskMap = new Map(dbTasks.map(t => [t._id.toString(), t]));
  const validProjectSet = new Set(validProjects.map(p => p._id.toString()));

  const bulkOps = [];
  const errors = [];

  // -----------------------------
  // Process updates
  // -----------------------------
  for (const item of tasks) {
    const {
      taskId,
      taskDate,
      projectCategory,
      project,
      projectStage,
      plannedDuration,
      actualDuration,
      status,
      taskDescription,
    } = item;

    const task = taskMap.get(taskId);

    if (!task) {
      errors.push({ taskId, error: "Task not found" });
      continue;
    }

    // Ownership check
    if (task.user.toString() !== req.user.id) {
      errors.push({ taskId, error: "Unauthorized" });
      continue;
    }

    // Date validation
    const effectiveDate = new Date(taskDate || task.taskDate || task.createdAt);
    effectiveDate.setHours(0, 0, 0, 0);

    if (effectiveDate < past15Days || effectiveDate > today) {
      errors.push({
        taskId,
        error: "Task date outside editable 15-day window",
      });
      continue;
    }

    // Build update object
    const update = {};

    if (taskDate !== undefined) {
      const dateOnly = new Date(taskDate);
      dateOnly.setHours(0, 0, 0, 0);  // Set to start of day
      update.taskDate = dateOnly;
    }
    if (projectCategory !== undefined) update.projectCategory = projectCategory;
    if (projectStage !== undefined) update.projectStage = projectStage;

    if (plannedDuration !== undefined) {
      if (plannedDuration < 0) {
        errors.push({ taskId, error: "Planned duration must be positive" });
        continue;
      }
      update.plannedDuration = plannedDuration;
    }

    if (actualDuration !== undefined) {
      if (actualDuration < 0) {
        errors.push({ taskId, error: "Actual duration must be positive" });
        continue;
      }
      update.actualDuration = actualDuration;
    }

    if (status !== undefined) update.status = status;

    if (taskDescription !== undefined) {
      update.taskDescription = taskDescription.trim();
    }

    // Project validation
    if (project !== undefined) {
      if (!validProjectSet.has(project)) {
        errors.push({ taskId, error: "Invalid project" });
        continue;
      }
      update.projectId = project;
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: taskId },
        update: { $set: update },
      },
    });
  }

  // -----------------------------
  // Execute bulk update
  // -----------------------------
  if (bulkOps.length > 0) {
    await Task.bulkWrite(bulkOps);
  }

  res.status(200).json({
    success: true,
    updatedCount: bulkOps.length,
    failedCount: errors.length,
    errors,
  });
});

// delete a task
export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task || task.isDeleted) {
    throw new ErrorHandler(404, "Task not found");
  }

  // Ownership / role check
  const isOwner = task.user.toString() === req.user.id;

  if (!isOwner) {
    throw new ErrorHandler(403, "Not allowed to delete this task");
  }

  // 15-day window check (for employees)
  if (isOwner) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const past15Days = new Date(today);
    past15Days.setDate(today.getDate() - 14);

    const taskDate = new Date(task.taskDate || task.createdAt);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate < past15Days || taskDate > today) {
      throw new ErrorHandler(400, "Tasks older than 15 days cannot be deleted");
    }
  }

  // Soft delete
  task.isDeleted = true;
  task.deletedAt = new Date();
  task.deletedBy = req.user.id;

  await task.save();

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});

// GET /timesheet/metadata
export const getTimesheetMetadata = asyncHandler(async (req, res) => {
  const projects = await Project.find({}, { _id: 1, projectName: 1 });

  res.status(200).json({
    success: true,
    projects, // [{ _id, projectName }]
    categories: [
      "implementation",
      "integration",
      "AMS",
      "leave",
      "week-off",
      "internal meeting",
      "administrative",
      "business development",
    ],
    stages: [
      "BPU",
      "Staging Config",
      "CRP",
      "TTT",
      "Prod Config",
      "Prod Review",
      "Go Live",
      "Hypercare",
      "Others",
      "half-day-leave",
      "full-day-leave",
      "week-off",
    ],
    statuses: ["in_progress", "completed", "cancelled"],
  });
});
