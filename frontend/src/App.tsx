import { FormEvent, useState } from "react";
import { useChat } from "./hooks/use-chat";
import { sendChatMessage } from "./lib/api";
import "./App.css";


function App() {
  const { messages, connectionState, isConnected, connectionError } = useChat();
  const [username, setUsername] = useState("Deep");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = text.trim();
    const name = username.trim();
    if (!message || !name || isSending) return;
    setIsSending(true); setError("");
    try {
      await sendChatMessage(name, message);
      setText("");
    } catch (sendError) { setError(sendError instanceof Error ? sendError.message : "Unable to send message"); }
    finally { setIsSending(false); }
  }

  return <main className="chat-shell"><section className="chat-card">
    <header className="chat-header"><div><p className="eyebrow">REALTIME CHAT</p><h1>Chat room</h1><p className="subtitle">Send a message and see it appear instantly.</p></div><span className={`status status-${connectionState}`}><i />{connectionState}</span></header>
    <div className="messages" aria-live="polite">{messages.length === 0 ? <div className="empty-state"><span>✦</span><p>No messages yet</p><small>Be the first to say hello.</small></div> : messages.map((item) => <article className="message" key={item.id}><div className="avatar">{item.username.charAt(0).toUpperCase()}</div><div className="message-body"><div className="message-meta"><strong>{item.username}</strong><time>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div><p>{item.message}</p></div></article>)}</div>
    <form className="composer" onSubmit={sendMessage}><input aria-label="Your name" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" maxLength={100} /><div className="message-input"><input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." maxLength={1000} /><button disabled={isSending || !isConnected || !text.trim() || !username.trim()}>{isSending ? "..." : "Send"}</button></div>{(error || connectionError) && <small className="error" role="alert">{error || connectionError}</small>}</form>
  </section></main>;
}

export default App;
