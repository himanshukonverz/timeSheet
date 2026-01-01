import express from "express"
import { addEmployeeInProject, createProject, getAllProjects, getEmployeesInProject } from "../controllers/project.js"
import { isAuthenticated, isAuthorized } from "../middleware/auth.js"
const router = express.Router()

router.get("/all", getAllProjects)
router.get("/:projectId", getEmployeesInProject)
router.post("/create", isAuthenticated, isAuthorized, createProject)
router.post("/:projectId/add", isAuthenticated, isAuthorized, addEmployeeInProject)

export default router