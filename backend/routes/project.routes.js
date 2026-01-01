import express from "express"
import { addEmployeeInProject, createProject, getAllProjects, getEmployeesInProject } from "../controllers/project.js"
const router = express.Router()

router.get("/all", getAllProjects)
router.get("/:projectId", getEmployeesInProject)
router.post("/create", createProject)
router.post("/:projectId/add", addEmployeeInProject)

export default router