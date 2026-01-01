import Project from "../models/project.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import { ErrorHandler } from "../utils/errorHandler.js"
import User from "../models/user.model.js"

// All project list
export const getAllProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find();

    res.status(200).json({
        success: true,
        projects
    });
});

// Get list of users in a project
export const getEmployeesInProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
        res.status(400);
        throw new ErrorHandler(400, "Project ID is required");
    }

    const contributors = await Project.findById(projectId).populate("contributors.user", "email role");

    if (!contributors) {
        res.status(400);
        throw new ErrorHandler(400, "Invalid Project ID");
    }

    res.status(200).json({
        success: true,
        contributors
    });
});

// create project
export const createProject = asyncHandler(
    async (req, res) => {
        const {projectName} = req.body;

        if (!projectName || projectName.trim() === "") {
            res.status(400);
            throw new ErrorHandler(400, "Project name is required");
        }

        // req.user.id comes from auth middleware
        if (!req.user || !req.user.id) {
            res.status(401);
            throw new ErrorHandler(403, "Unauthorized: user not found");
        }

        const newProject = await Project.create({
            projectName : projectName.trim(),
            contributors : [
                {user : req.user.id, role : "owner"}
            ]
        })

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            newProject
        });
    }
)

// Add user to a project
export const addEmployeeInProject = asyncHandler(async (req, res) => {
    const { projectId, empId, role } = req.body;
  
    // 1️⃣ Basic validation
    if (!projectId || !empId || !role) {
      throw new ErrorHandler(400, "Invalid Fields");
    }
  
    // 2️⃣ Find the user by empId
    const user = await User.findOne({ empId });
  
    if (!user) {
      throw new ErrorHandler(404, "Employee with given empID does not exist");
    }

    // 3️⃣ Find the project
    const project = await Project.findById(projectId);
  
    if (!project) {
      throw new ErrorHandler(404, "Project not found");
    }
  
    // 4️⃣ Check if user is already part of the project
    const alreadyExists = project.contributors.some(
      (contributor) => contributor.user.toString() === user._id.toString()
    );
  
    if (alreadyExists) {
      throw new ErrorHandler(400, "Employee already added to this project");
    }
  
    // 5️⃣ Add employee to contributors
    project.contributors.push({
      user: user._id,
      role
    });
  
    await project.save();
  
    res.status(200).json({
      success: true,
      message: "Employee added to project successfully",
      data: {
        projectId: project._id,
        employee: {
          empId: user.empId,
          name: user.name,
          email: user.email,
          role
        }
      }
    });
  });