import { useState, useRef, useEffect } from "react";
import { FiSearch, FiPlus, FiTool, FiCompass, FiGlobe } from "react-icons/fi";
import MessageBubble from "../components/MessageBubble";
import SuggestionButtons from "../components/SuggestionButtons";
import AgentSuggestions from "../components/AgentSuggestions";
import { applyHighlighting } from "../utils/chatFormatting";
import { sendChatMessage } from "../utils/sendChatMessage";
import { useAgentSuggestions } from "../hooks/useAgentSuggestions";
import { useAuth } from "../contexts/AuthContext";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  const organisationShortName = user?.organisation?.short_name || "your company";

  const {
    suggestions,
    showSuggestions,
    selectedAgent,
    updateSuggestions,
    selectSuggestion,
    clearSelectedAgent,
    setShowSuggestions,
  } = useAgentSuggestions();

  const sendMessage = async () => {
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsStreaming(true);
    setShowSuggestions(false);

    const agentKey = selectedAgent;
    const message = query;

    let assistantReply = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      await sendChatMessage({
        message,
        agentKey,
        orgId: String(user?.organisation?.id ?? ""),
        onStream: (chunk) => {
          assistantReply += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex].role === "assistant") {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: assistantReply,
              };
            }
            return updated;
          });
        },
      });
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };

    if (toolsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toolsOpen]);

  const hasStarted = messages.length > 0;

  const renderInputBar = () => (
    <div className="relative rounded-2xl border border-gray-300 shadow-sm bg-white w-full px-4 py-3 space-y-3">
      {/* Selected Agent Tag */}
      {selectedAgent && (
        <div>
          <button
            onClick={clearSelectedAgent}
            className="flex items-center bg-blue-50 text-blue-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-blue-100 transition"
            title="Click to remove agent"
          >
            @{selectedAgent}
          </button>
        </div>
      )}

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            updateSuggestions(value);
          }}
          placeholder={isStreaming ? "Waiting for reply..." : "Ask anything..."}
          disabled={isStreaming}
          className="w-full resize-none overflow-hidden outline-none text-gray-700 placeholder-gray-400 bg-transparent px-2 py-1 min-h-[36px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <AgentSuggestions
            suggestions={suggestions}
            onSelect={(agent) => selectSuggestion(agent, setQuery)}
          />
        )}
      </div>

      {/* Upload, Tools, Search */}
      <div className="flex items-center justify-between pt-2">
        {/* Left Buttons */}
        <div className="flex items-center gap-3">
          {/* Upload */}
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <FiPlus size={14} />
              Upload
            </button>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log("File selected:", file.name);
                }
              }}
            />
          </div>

          {/* Tools */}
          <div className="relative" ref={toolsRef}>
            <button
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              onClick={() => setToolsOpen((prev) => !prev)}
            >
              <FiTool size={14} />
              Tools
            </button>

            {toolsOpen && (
              <div className="absolute z-10 mt-2 bg-white border rounded shadow-md w-48 text-sm">
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => alert("Example Tool 1")}
                >
                  <FiSearch size={14} />
                  <span>Find a document</span>
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => alert("Example Tool 2")}
                >
                  <FiCompass size={14} />
                  <span>Deep Research</span>
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => alert("Example Tool 3")}
                >
                  <FiGlobe size={14} />
                  <span>Search the web</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div>
          <button
            title="Send"
            onClick={sendMessage}
            disabled={isStreaming}
            className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <FiSearch size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 w-full h-full px-4">
      {!hasStarted ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Welcome to {organisationShortName}'s Basecamp. How can I help?
          </h1>
          <div className="w-full max-w-3xl">
            {renderInputBar()}
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
            {renderInputBar()}
          </div>
        </div>
      )}
    </div>
  );
}
