import { useEffect , useState } from "react";
import pusher from "../lib/pusher-client";
import type { ChatMessage } from "../types/chat.type";

export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConected] = useState(false);

    useEffect(() =>{
        const handleConnected = () => setIsConected(true);
        const handleDisconnected = () => setIsConected(false);

        pusher.connection.bind("connected", handleConnected);
        pusher.connection.bind("disconnected", handleDisconnected);

        const channel = pusher.subscribe("chat-room");

        const handleMessage = (message: ChatMessage) => {
            setMessages((prev) => [...prev, message])
        };

        channel.bind("new-message", handleMessage);

        setIsConected(pusher.connection.state === "connected");

        return () => {
            channel.unbind("new-message", handleMessage);
            pusher.unsubscribe("chat-room");

            pusher.connection.unbind("connected", handleConnected);
            pusher.connection.unbind("disconnected", handleDisconnected)
        }
    }, [])

    return {
        messages,
        isConnected
    };
}
