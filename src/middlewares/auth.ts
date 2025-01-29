import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  role?: string;
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) : any => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Please login to continue" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      role: string;
      id: string;
    };
    req.role = decoded.role;
    req.userId = decoded.id;

    if (req.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Access denied: Admin privileges required" });
    }
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(500).json({ error: "Authentication error" });
  }
};
