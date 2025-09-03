import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

      // Attach user info safely
      req.user = {
        id: decoded.id as string,
        name: decoded.name as string,
      };

      next();
      return;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          message: "Authentication failed: Token has expired. Please login again.",
        });
        return;
      }

      if (err instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          message: "Authentication failed: Token is invalid.",
        });
        return;
      }

      res.status(500).json({
        message: "An unexpected error occurred during authentication.",
      });
      return;
    }
  } else {
    res.status(401).json({
      message: "Authentication failed: No token provided.",
    });
    return;
  }
};
