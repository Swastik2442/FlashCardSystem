import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const cookieOptions = {
    httpOnly: true,
    secure: true,
}

async function generateAccessAndRefreshTokens(userId: mongoose.Types.ObjectId) {
    try {
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user)
            throw new Error("User not found");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // Saves without triggering Pre Hooks

        return {accessToken, refreshToken};
    } catch (error: any) {
        throw new Error(`An Error occured while generating Refresh and Access Tokens: ${error.message}`)
    }
}

/**
 * @route POST v1/auth/register
 * @desc Registers a User
 * @access public
 */
export async function Register(req: ExpressRequest, res: ExpressResponse) {
    const { fullName, email, username, password } = req.body;
    try {
        const existingUser = await User.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email }]
        }).select("-password -refreshToken");
        if (existingUser) {
            res.status(400).json({
                status: "failed",
                message: "Account already exists",
            });
            return;
        }

        const newUser = await User.create({
            fullName: fullName,
            email: email,
            username: username,
            password: password,
        });

        const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
        if (!createdUser)
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
            });

        res.status(200).json({
            status: "success",
            message: "Registration Successful",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

/**
 * @route POST v1/auth/login
 * @desc logs in a User
 * @access public
 */
export async function Login(req: ExpressRequest, res: ExpressResponse) {
    const { email, username, password } = req.body;
    if (!username && !email) {
        res.status(400).json({
            status: "failed",
            message: "Either email or username is required",
        });
        return;
    }

    try {
        const user = await User.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email }]
        });
        if (!user) {
            res.status(400).json({
                status: "failed",
                message: "Account does not exist",
            });
            return;
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            res.status(401).json({
                status: "failed",
                message: "Incorrect Password",
            });
            return;
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

        res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
            status: "success",
            message: "Login Successful",
        })
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

/**
 * @route GET /auth/logout
 * @desc Logs out the User
 * @access private
 */
export async function Logout(req: ExpressRequest, res: ExpressResponse) {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            { $set: { refreshToken: null } },
            // { new: true }
        )

        res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json({
            status: "success",
            message: "Logout Successful",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

/**
 * @route GET /auth/refresh-token
 * @desc Refreshes the Access Token of the User
 * @access private
 */
export async function RefreshAccessToken(req: ExpressRequest, res: ExpressResponse) {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) {
        res.status(400).json({
            status: "failed",
            message: "Refresh Token not Found",
        });
        return;
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        )
        const user = await User.findById((decodedToken as jwt.JwtPayload)?._id).select("-password");

        if (!user) {
            res.status(401).json({
                status: "failed",
                message: "Invalid Refresh Token",
            });
            return;
        } else if (incomingRefreshToken !== user?.refreshToken) {
            res.status(401).json({
                status: "failed",
                message: "Refresh Token is expired or used",
            });
            return;
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
        res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json({
            status: "success",
            message: "Access Token refreshed",
        })
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}
