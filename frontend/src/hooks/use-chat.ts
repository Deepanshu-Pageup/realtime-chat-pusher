import { useEffect, useState } from "react";
import pusher from "../lib/pusher-client";
import type { ChatMessage } from "../types/chat.type";

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        const handleConnected = () => {
            setIsConnected(true);
            setConnectionError(null);
        };
        const handleDisconnected = () => setIsConnected(false);
        const handleUnavailable = () => {
            setIsConnected(false);
            setConnectionError("Realtime connection unavailable. Retrying...");
        };
        const handleFailed = () => {
            setIsConnected(false);
            setConnectionError("Realtime is not supported in this browser.");
        };
        const handleConnectionError = () => {
            setConnectionError("Realtime connection error. Retrying...");
        };

        pusher.connection.bind("connected", handleConnected);
        pusher.connection.bind("disconnected", handleDisconnected);
        pusher.connection.bind("unavailable", handleUnavailable);
        pusher.connection.bind("failed", handleFailed);
        pusher.connection.bind("error", handleConnectionError);

        const channel = pusher.subscribe("chat-room");

        const handleSubscriptionError = () => {
            setConnectionError("Could not join the chat room.");
        };
        channel.bind("pusher:subscription_error", handleSubscriptionError);

        const handleMessage = (message: ChatMessage) => {
            if (!message || typeof message.id !== "string" || typeof message.message !== "string") return;
            setMessages((prev) =>
                prev.some((m) => m.id === message.id) ? prev : [...prev, message]
            );
        };

        channel.bind("new-message", handleMessage);

        setIsConnected(pusher.connection.state === "connected");

        return () => {
            channel.unbind("new-message", handleMessage);
            channel.unbind("pusher:subscription_error", handleSubscriptionError);
            pusher.unsubscribe("chat-room");

            pusher.connection.unbind("connected", handleConnected);
            pusher.connection.unbind("disconnected", handleDisconnected);
            pusher.connection.unbind("unavailable", handleUnavailable);
            pusher.connection.unbind("failed", handleFailed);
            pusher.connection.unbind("error", handleConnectionError);
        };
    }, []);

    return { messages, isConnected, connectionError };
}
