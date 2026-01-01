import asyncHandler from "../utils/asyncHandler.js"
import Task from "../models/task.model.js"
import User from "../models/user.model.js"
import { ErrorHandler } from "../utils/errorHandler";
import Project from "../models/project.model.js";

// Get All task 
export const getAllTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find({
            isDeleted: false,
    })
      .populate("user", "name email empId")
      .populate("project", "projectName")
      .sort({ createdAt: -1 });
  
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
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
      if (!["admin", "manager"].includes(requester.role)) {
        throw new ErrorHandler(
          403,
          "You are not allowed to view other users' tasks"
        );
      }
  
      const employee = await User.findOne({ empId: req.query.empId });
  
      if (!employee) {
        throw new ErrorHandler(404, "Employee not found");
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
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
    })
      .populate("project", "projectName")
      .sort({ createdAt: -1 });
  
    res.status(200).json({
      success: true,
      meta: {
        fromDate: startDate,
        toDate: endDate
      },
      count: tasks.length,
      data: tasks
    });
  });

// create a task
export const createTask = asyncHandler(async (req, res) => {
  const {
    projectId,
    projectCategory,
    projectStage,
    taskDescription,
    plannedDuration,
    actualDuration,
    status
  } = req.body;

  // -------------------------
  // 1️⃣ Validate required fields
  // -------------------------
  if (
    !projectId ||
    !projectCategory ||
    !projectStage ||
    !taskDescription ||
    plannedDuration === undefined ||
    !status
  ) {
    throw new ErrorHandler(400, "All required fields must be provided");
  }

  // -------------------------
  // 2️⃣ Validate project exists
  // -------------------------
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ErrorHandler(404, "Project not found");
  }

  // -------------------------
  // 3️⃣ Check if user is part of the project
  // -------------------------
  const isContributor = project.contributors.some(
    (contributor) =>
      contributor.user.toString() === req.user.id
  );

  if (!isContributor) {
    throw new ErrorHandler(
      403,
      "You are not a contributor of this project"
    );
  }

  // -------------------------
  // 4️⃣ Create task
  // -------------------------
  const task = await Task.create({
    user: req.user.id,
    project: projectId,
    projectCategory,
    projectStage,
    taskDescription: taskDescription.trim(),
    plannedDuration,
    actualDuration: actualDuration || 0,
    status
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task
  });
});

// update a task
export const updateTasks = asyncHandler(async (req, res) => {
    const { tasks } = req.body;
  
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new ErrorHandler(400, "Tasks array is required");
    }
  
    const updatedTasks = [];
    const errors = [];
  
    // -----------------------------
    // Date window (last 15 days)
    // -----------------------------
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const past15Days = new Date(today);
    past15Days.setDate(today.getDate() - 14);
  
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
        taskDescription
      } = item;
  
      if (!taskId) {
        errors.push({ taskId, error: "Task ID missing" });
        continue;
      }
  
      const task = await Task.findById(taskId);
  
      if (!task) {
        errors.push({ taskId, error: "Task not found" });
        continue;
      }
  
      // -----------------------------
      // Ownership check
      // -----------------------------
      if (task.user.toString() !== req.user.id) {
        errors.push({ taskId, error: "Unauthorized" });
        continue;
      }
  
      // -----------------------------
      // Date scope check
      // -----------------------------
      const effectiveDate = taskDate
        ? new Date(taskDate)
        : new Date(task.taskDate || task.createdAt);
  
      effectiveDate.setHours(0, 0, 0, 0);
  
      if (effectiveDate < past15Days || effectiveDate > today) {
        errors.push({
          taskId,
          error: "Task date outside editable 15-day window"
        });
        continue;
      }
  
      // -----------------------------
      // Allowed field updates
      // -----------------------------
      if (taskDate !== undefined) {
        task.taskDate = new Date(taskDate);
      }
  
      if (projectCategory !== undefined) {
        task.projectCategory = projectCategory;
      }
  
      if (projectStage !== undefined) {
        task.projectStage = projectStage;
      }
  
      if (plannedDuration !== undefined) {
        if (plannedDuration < 0) {
          errors.push({ taskId, error: "Planned duration must be positive" });
          continue;
        }
        task.plannedDuration = plannedDuration;
      }
  
      if (actualDuration !== undefined) {
        if (actualDuration < 0) {
          errors.push({ taskId, error: "Actual duration must be positive" });
          continue;
        }
        task.actualDuration = actualDuration;
      }
  
      if (status !== undefined) {
        task.status = status;
      }
  
      if (taskDescription !== undefined) {
        task.taskDescription = taskDescription.trim();
      }
  
      // -----------------------------
      // Project validation
      // -----------------------------
      if (project !== undefined) {
        const projectExists = await Project.exists({ _id: project });
        if (!projectExists) {
          errors.push({ taskId, error: "Invalid project" });
          continue;
        }
        task.project = project;
      }
  
      await task.save();
      updatedTasks.push(task);
    }
  
    res.status(200).json({
      success: true,
      updatedCount: updatedTasks.length,
      failedCount: errors.length,
      updatedTasks,
      errors
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
        throw new ErrorHandler(
          400,
          "Tasks older than 15 days cannot be deleted"
        );
      }
    }
  
    // Soft delete
    task.isDeleted = true;
    task.deletedAt = new Date();
    task.deletedBy = req.user.id;
  
    await task.save();
  
    res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  });