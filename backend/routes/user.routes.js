import express from "express"
import { createUser, fetchManagersAndAdmin, getUserProfileData } from "../controllers/user.js"
import { isAuthenticated, isAuthorized } from "../middleware/auth.js"
const router = express.Router()

router.post("/create", isAuthenticated, isAuthorized, createUser)

router.get("/admin-manager", isAuthenticated, isAuthorized, fetchManagersAndAdmin)

router.get("/profile", isAuthenticated, getUserProfileData)

export default router