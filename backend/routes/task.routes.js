import express from "express"
import { createTasks, deleteTask, getAllTasks, getEmployeeTasks, getTimesheetMetadata, updateTasks } from "../controllers/task.js";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";

const router = express.Router()

router.get("/all", isAuthenticated, getAllTasks);

router.get("/employee", isAuthenticated, getEmployeeTasks);

router.post("/create", isAuthenticated, createTasks);

router.put("/", isAuthenticated, updateTasks);

router.delete("/:taskId", isAuthenticated, deleteTask);

router.get("/metadata", isAuthenticated, getTimesheetMetadata);

export default router