import { pusher } from "../../config/pusher";
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

    await pusher.trigger(
        "chat-room",
        "new-message",
        newMessage
    );

    return newMessage;
};