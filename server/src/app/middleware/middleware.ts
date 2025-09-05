import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
      req.headers.userid = decoded.id as string;
      req.headers.Username = decoded.name as string;
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          message: "Authentication failed: Token has expired. Please login again.",
        });
      }

      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          message: "Authentication failed: Token is invalid.",
        });
      }

      // Handle any unexpected errors
      return res.status(500).json({
        message: "An unexpected error occurred during authentication.",
      });
    }
  } else {
    return res.status(401).json({
      message: "Authentication failed: No token provided.",
    });
  }
};
