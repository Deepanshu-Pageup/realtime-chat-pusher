import { pusher } from "../../config/pusher";
import { AppError } from "../../common/app-error";
import type { ChatMessage } from "./chat.types";
import type { sendMessageInput } from "./chat.schema";

export const sendMessage = async (
    input: sendMessageInput
): Promise<ChatMessage> => {

    const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        username: input.username,
        message: input.message,
        createdAt: new Date().toISOString(),
    };

    try {
        await pusher.trigger("chat-room", "new-message", newMessage);
    } catch (error) {
        console.error("Pusher trigger failed:", error);
        throw new AppError(
            502,
            "Could not deliver the message. Please try again.",
            "BROADCAST_FAILED"
        );
    }

    return newMessage;
};
