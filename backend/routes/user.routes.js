import express from "express"
import { createUser } from "../controllers/user.js"
import { isAuthenticated, isAuthorized } from "../middleware/auth.js"
const router = express.Router()

router.post("/create", isAuthenticated, isAuthorized, createUser)

export default router