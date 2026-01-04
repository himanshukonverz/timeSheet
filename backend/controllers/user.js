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

export const getUserProfileData = asyncHandler(async (req, res) => {
  const { id } = req.user;
  // console.log("req user - ", req.user)

  const user = await User.findById(id)
    .select("name email joiningDate reportsTo empId")
    .populate({
      path: "reportsTo",
      select: "name",
    });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const profilePicMap = {
    1001: "https://res.cloudinary.com/dr9ijlk4w/image/upload/v1767541807/8_orgid_ba899eaa-e7c4-485e-9860-8ecd15c416e5_udlksg.jpg",
    1002: "https://res.cloudinary.com/dr9ijlk4w/image/upload/v1767541789/8_orgid_daee4f0b-004f-49a7-8af3-309ebbb1a1e6_k1vber.jpg",
    1003: "https://res.cloudinary.com/dr9ijlk4w/image/upload/v1767541642/8_orgid_a165ca98-52e0-4a8a-b736-77c3667e5692_qlead9.jpg",
    1004: "https://res.cloudinary.com/dr9ijlk4w/image/upload/v1767540995/Image_t8wvcd.jpg",
  };

  const DEFAULT_PROFILE_PIC =
  "https://res.cloudinary.com/dr9ijlk4w/image/upload/v1767542076/icon-7797704_1280_vlnhqv.png";

  const profilePic = (empId) => {
    return profilePicMap[empId] || DEFAULT_PROFILE_PIC;
  }  

  res.status(200).json({
    name: user.name,
    empId : user.empId,
    email: user.email,
    joiningDate: user.joiningDate,
    reportsTo: user.reportsTo ? user.reportsTo.name : null,
    profilePic : profilePic(user.empId)
    });
});
