import express from "express"
import { createTask, deleteTask, getAllTasks, getEmployeeTasks, updateTasks } from "../controllers/task.js";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";

const router = express.Router()

router.get("/all", isAuthenticated, getAllTasks);

router.get("/employee", isAuthenticated, getEmployeeTasks);

router.post("/create", isAuthenticated, createTask);

router.put("/", isAuthenticated, updateTasks);

router.delete("/:taskId", isAuthenticated, deleteTask);

export default router