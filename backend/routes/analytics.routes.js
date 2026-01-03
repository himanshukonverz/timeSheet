import express from "express"
import { isAuthenticated, isAuthorized } from "../middleware/auth.js"

const router = express.Router()

router.get("/admin", isAuthenticated, isAuthorized)

router.get("/me", isAuthenticated)

export default router

