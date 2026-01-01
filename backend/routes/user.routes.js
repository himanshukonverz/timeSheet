import express from "express"
import { createUser } from "../controllers/user.js"
import { isAdmin } from "../middleware/auth.js"
const router = express.Router()

router.post("/create", createUser)

export default router