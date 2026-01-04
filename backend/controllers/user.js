import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../utils/errorHandler.js";

// create user
export const createUser = asyncHandler(async (req, res) => {
  // console.log("req body - ", req.body)
  const { empId, name, email, password, joiningDate, reportsTo, role } =
    req.body;

  // 1️⃣ Basic required field validation
  if ((!empId, !name || !email || !password || !joiningDate || !role)) {
    throw new ErrorHandler(400, "Required fields are missing");
  }

  // 2️⃣ Check duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorHandler(400, "User with this email already exists");
  }
  const existingUserWithEmpId = await User.findOne({ empId });
  if (existingUserWithEmpId) {
    throw new ErrorHandler(400, "User with this Employee ID already exists");
  }

  // 3️⃣ Validate reportsTo (if provided)
  let managerId = null;
  if (reportsTo) {
    const manager = await User.findOne({ empId: reportsTo });
    if (!manager) {
      throw new ErrorHandler(400, "Reporting manager not found");
    }
    managerId = manager._id;
  }

  // 4️⃣ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5️⃣ Create user (emp_id auto-generated in pre-save hook)
  const user = await User.create({
    empId,
    name,
    email,
    password: hashedPassword,
    joiningDate,
    reportsTo: managerId,
    role,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      id: user._id,
      emp_id: user.empId,
    },
  });
});

export const fetchManagersAndAdmin = asyncHandler(async (req, res) => {
  const users = await User.find({
    role: { $in: ["admin", "manager"] },
  })
    .select("empId name role -_id") // optional: send only needed fields
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    users,
  });
});
