import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import {ErrorHandler} from "../utils/errorHandler.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// login
export const login = asyncHandler(
    async (req, res, next) => {
        const { email, password } = req.body;
      
        try {
          let user = await User.findOne({ email });
      
          if (!user) {
            throw new ErrorHandler(404, 'Invalid email or password');
          }
      
          const isPasswordCorrect = await bcrypt.compare(password, user.password);
          if (!isPasswordCorrect) {
            throw new ErrorHandler(400, 'Invalid Email or password');
          }
      
          const token = jwt.sign(
            { name: user.name, id: user._id, role : user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
          );
      
          const isProd = process.env.NODE_ENV === "production";
      
          const cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000
          };
      
          res.cookie('accessToken', token, cookieOptions);
          res.status(200).json({
            success: true,
            message: `Welcome ${user.name}`,
            user: {
                id: user._id,
                empId: user.empId,
                name: user.name,
                email: user.email,
                role: user.role
            }
          });
        } catch (err) {
          next(err);
        }
    }
)

// logout
export const logout = asyncHandler(async (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
  
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: "None"
    });
  
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  });


// Fetch Current User
export const getCurrentLoggedInUser = asyncHandler(
    async (req, res) => {
        if(!req.user){
            throw new ErrorHandler(404, 'Please Login First');
        }

        return res.json({
            user : req.user
        })
    }
)