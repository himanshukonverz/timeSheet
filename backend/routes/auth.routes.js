import express from "express"
import { login, logout } from "../controllers/auth.js"
import { isAuthenticated } from "../middleware/auth.js"
const router = express.Router()

router.post("/login", login)
router.post("/logout", isAuthenticated, logout)

export default router