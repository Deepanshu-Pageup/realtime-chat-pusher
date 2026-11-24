import type { Request, Response, NextFunction } from "express";
import { sendMessageSchema } from "./chat.schema";
import * as chatService from "./chat.service";

export const createMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const input = sendMessageSchema.parse(req.body);

        const message = await chatService.sendMessage(input);

        return res.status(201).json({
            success: true,
            message: "Message broadcast successfully",
            data: message,
        });
    } catch (error) {
        next(error);
    }
};