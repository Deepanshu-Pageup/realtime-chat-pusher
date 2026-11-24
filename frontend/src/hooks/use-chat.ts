import { useEffect, useState } from "react";
import pusher from "../lib/pusher-client";
import type { ChatMessage } from "../types/chat.type";

export type ChatConnectionState =
    | "initialized" | "connecting" | "connected"
    | "unavailable" | "failed" | "disconnected";

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connectionState, setConnectionState] = useState<ChatConnectionState>(pusher.connection.state as ChatConnectionState);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        const handleStateChange = (change: { previous: string; current: string }) => {
            setConnectionState(change.current as ChatConnectionState);
            if (change.current === "connected") setConnectionError(null);
        };
        const handleUnavailable = () => {
            setConnectionError("Realtime connection unavailable. Retrying...");
        };
        const handleFailed = () => {
            setConnectionError("Realtime is not supported in this browser.");
        };
        const handleConnectionError = () => {
            setConnectionError("Realtime connection error. Retrying...");
        };

        pusher.connection.bind("state_change", handleStateChange);
        pusher.connection.bind("unavailable", handleUnavailable);
        pusher.connection.bind("failed", handleFailed);
        pusher.connection.bind("error", handleConnectionError);

        const channel = pusher.subscribe("chat-room");

        const handleSubscriptionError = () => {
            setConnectionError("Could not join the chat room.");
        };
        const handleSubscriptionSucceeded = () => {
            setConnectionError(null);
        };
        channel.bind("pusher:subscription_error", handleSubscriptionError);
        channel.bind("pusher:subscription_succeeded", handleSubscriptionSucceeded);

        const handleMessage = (message: ChatMessage) => {
            if (!message || typeof message.id !== "string" || typeof message.message !== "string") return;
            setMessages((prev) =>
                prev.some((m) => m.id === message.id) ? prev : [...prev, message]
            );
        };

        channel.bind("new-message", handleMessage);

        setConnectionState(pusher.connection.state as ChatConnectionState);

        return () => {
            channel.unbind("new-message", handleMessage);
            channel.unbind("pusher:subscription_error", handleSubscriptionError);
            channel.unbind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
            pusher.unsubscribe("chat-room");

            pusher.connection.unbind("state_change", handleStateChange);
            pusher.connection.unbind("unavailable", handleUnavailable);
            pusher.connection.unbind("failed", handleFailed);
            pusher.connection.unbind("error", handleConnectionError);
        };
    }, []);

    return { messages, connectionState, isConnected: connectionState === "connected", connectionError };
}
