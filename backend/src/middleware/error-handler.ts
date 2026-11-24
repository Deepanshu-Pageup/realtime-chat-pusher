import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../common/app-error";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, "NOT_FOUND"));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    let statusCode = 500;
    let code = "INTERNAL_ERROR";
    let message = "Something went wrong. Please try again.";
    let details: unknown;

    if (err instanceof ZodError) {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        message = "Invalid request data";
        details = err.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
    } else if (err instanceof AppError) {
        ({ statusCode, code, message, details } = err);
    } else if (isHttpError(err)) {
        // body-parser errors: malformed JSON, payload too large, etc.
        statusCode = err.status;
        code = err.type === "entity.too.large" ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST";
        message =
            err.type === "entity.parse.failed" ? "Request body is not valid JSON" :
            err.type === "entity.too.large" ? "Request body is too large" :
            "Bad request";
    }

    if (statusCode >= 500) {
        console.error(`[${req.method} ${req.originalUrl}]`, err);
    }

    res.status(statusCode).json({
        success: false,
        error: { code, message, ...(details ? { details } : {}) },
    });
};

function isHttpError(err: unknown): err is { status: number; type?: string } {
    return (
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        typeof (err as { status: unknown }).status === "number" &&
        (err as { status: number }).status >= 400 &&
        (err as { status: number }).status < 500
    );
}
