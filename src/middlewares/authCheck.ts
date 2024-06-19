import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/HttpError";
import { JwtPayload, verify } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userData?: string | JwtPayload;
    }
  }
}

export default function authCheck(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") {
    next();
  }

  try {
    // 'Bearer <token>'
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed");
    }
    const decodedToken = verify(token, `${process.env.JWT_SECRET}`) as {
      userId: string;
      email: string;
      iat: number;
      exp: number;
    };

    req.userData = decodedToken;
    next();
  } catch (err) {
    return next(new HttpError("Authentication failed", 401));
  }
}
