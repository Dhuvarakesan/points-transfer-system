import { Request, Response } from 'express';
import { CustomError } from '../errorHandeling/customError';
import handleError from '../errorHandeling/handelError'; // Import the handleError function
import User from '../models/users.model';
import { generateRefreshToken, generateToken, verifyRefreshToken } from '../utils/jwt';

// Authenticate a user
export const authenticateUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        console.log('email:', email);
        const user = await User.findOne({ email });
        console.log('user Details:', user);
        if (!user) {
            throw new CustomError("Invalid email or password.", 401, "AUTHENTICATION_FAILED", "The email or password is incorrect.");
        }

        // Compare the provided password with the stored encrypted password
        console.log('password',password)
        const isMatch = user.comparePassword(password);
        console.log('checking validity:', isMatch);
        if (!isMatch) {
            throw new CustomError("Invalid email or password.", 401, "AUTHENTICATION_FAILED", "The email or password is incorrect.");
        }

        const userId: string = user._id as string;
        const token = generateToken(userId, email);
        const refreshToken = generateRefreshToken(userId);
        console.log('token:', token);
        res.status(200).json({
            status: "success",
            code: "200",
            message: "User authenticated successfully.",
            data: { id: user._id, accessToken: token, refreshToken: refreshToken, user },
        });
    } catch (error) {
        handleError(res, error);
    }
};

// Refresh access token
export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            return res
                .status(401)
                .json({ error: "Unauthorized, refresh token not provided" });
        }

        // Verify the refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find the user associated with the refresh token
        const user = await User.findById(decoded.id);
        if (!user || decoded.id != user._id) {
            return res
                .status(403)
                .json({ error: "Forbidden, invalid or expired refresh token" });
        }

        // Generate a new access token
        const newAccessToken = generateToken((user._id as string).toString(), user.email);

        res.status(200).json({
            status: "success",
            code: "200",
            message: "Access token refreshed successfully.",
            accessToken: newAccessToken,
        });
    } catch (error) {
        return res.status(403).json({ error: "Invalid or expired refresh token" });
    }
};
