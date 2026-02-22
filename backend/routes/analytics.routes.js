import express from "express"
import { isAuthenticated, isAuthorized } from "../middleware/auth.js"
import { getAdminAnalytics, getMyAnalytics } from "../controllers/analytics.js"

const router = express.Router()

router.get("/admin", isAuthenticated, isAuthorized, getAdminAnalytics)

router.get("/me", isAuthenticated, getMyAnalytics)

export default router

