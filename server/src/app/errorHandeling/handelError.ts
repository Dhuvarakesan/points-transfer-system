import { Response } from "express";
import { CustomError } from "./customError";

const handleError = (res: Response, error: any) => {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        status: "error",
        code: error.statusCode.toString(),
        message: error.message,
        errorCode: error.errorCode,
        errorMessage: error.errorMessage,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        status: "error",
        code: "500",
        message: "An unexpected error occurred.",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
  export default handleError;