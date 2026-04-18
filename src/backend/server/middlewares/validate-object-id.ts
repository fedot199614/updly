import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const validateObjectId = (param: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[param];

    if (!mongoose.Types.ObjectId.isValid(value) || value === 'undefined') {
      return res.status(400).json({ error: `Invalid param ${param}` });
    }

    next();
  };
};