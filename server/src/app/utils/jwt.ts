import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Generate JWT Token
export const generateToken = (userId: string, email: string): string => {
    return jwt.sign({ id: userId, email: email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT Token
export const verifyAccessToken = (token: string): jwt.JwtPayload => {

    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
};

// Generate Refresh Token
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET as string , { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });
}
// Verify Refresh Token
export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;
}
