import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import MessageBubble from "../components/MessageBubble";
import SuggestionButtons from "../components/SuggestionButtons";
import { applyHighlighting } from "../utils/chatFormatting";
import { useAuth } from "../contexts/AuthContext"; // ✅ Added

const BACKEND_URL = "https://basecampai.ngrok.io";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth(); // ✅ Access user from context

  const sendMessage = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsStreaming(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": String(user?.organisation?.id ?? ""), // ✅ Inject org ID
        },
        body: JSON.stringify({ message: query }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = "";

      // Append a new empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantReply += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].role === "assistant") {
            updated[lastIndex] = { ...updated[lastIndex], content: assistantReply };
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("❌ Failed to stream chat:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error: Unable to reach the server." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const hasStarted = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 w-full h-full px-4">
      {!hasStarted ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to RTI's Basecamp. How can I help?
          </h1>
          <div className="w-full max-w-3xl">
            <div className="w-full rounded-2xl border border-gray-300 shadow-sm bg-white flex items-center px-4 py-3 gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 outline-none px-4 text-gray-700 placeholder-gray-400 bg-transparent"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button title="Send" onClick={sendMessage} className="text-gray-500">
                <FiSearch size={18} />
              </button>
            </div>
            <SuggestionButtons setQuery={setQuery} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 max-w-4xl w-full mx-auto relative">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, index) => (
              <MessageBubble
                key={index}
                role={msg.role}
                content={msg.content}
                applyHighlighting={applyHighlighting}
              />
            ))}
            <div ref={chatBottomRef} />
          </div>
          <div className="sticky bottom-0 bg-white pt-2 pb-5 px-4">
            <div className="rounded-2xl border border-gray-300 shadow-sm bg-white flex items-center px-4 py-3 gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isStreaming ? "Waiting for reply..." : "Ask anything..."}
                disabled={isStreaming}
                className="flex-1 outline-none px-4 text-gray-700 placeholder-gray-400 bg-transparent"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                title="Send"
                onClick={sendMessage}
                disabled={isStreaming}
                className="text-gray-500"
              >
                <FiSearch size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
