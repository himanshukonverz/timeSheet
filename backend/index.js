import express from "express"
import dotenv from 'dotenv'
dotenv.config()
import { connectDB } from "./utils/dbConnect.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import {errorMiddleware} from "./middleware/errorMiddleware.js"

// importing routes
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import projectRoutes from "./routes/project.routes.js"
import taskRoutes from "./routes/task.routes.js"

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = ["http://localhost:5173"]

const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
}

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors(corsOptions))
// app.use(cors())
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/project", projectRoutes)
app.use("/api/task", taskRoutes)

app.use(errorMiddleware)

connectDB()
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
  