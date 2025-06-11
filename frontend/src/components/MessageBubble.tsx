import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  role: string;
  content: string;
  applyHighlighting: (text: string) => string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, applyHighlighting }) => {
  const isUser = role === "user";
  const isLoading = role === "assistant" && content.trim() === "";

  const highlightedContent = applyHighlighting(content).trim();

  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev === 3 ? 1 : prev + 1));
    }, 400);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div
      className={`text-sm p-3 rounded-lg max-w-full ${
        isUser
          ? "bg-blue-100 text-blue-800 self-end ml-20"
          : "bg-transparent text-gray-700 self-start mr-20"
      }`}
    >
      <div className="mb-1 font-bold">{isUser ? "You" : "Basecamp"}:</div>

      {isLoading ? (
        <div className="text-xl text-gray-400 select-none">
          {'.'.repeat(dotCount)}
        </div>
      ) : (
        <ReactMarkdown
          children={highlightedContent}
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, children }) => {
              const parentType = (node as any)?.parent?.type;
              const isListItem = parentType === "listItem";
              return isListItem ? <span>{children}</span> : <p className="mb-2">{children}</p>;
            },
            li: ({ children }) => (
              <li className="list-disc ml-4 mb-0 leading-tight [&>p]:mb-0 [&>p]:inline">{children}</li>
            ),
            ul: ({ children }) => (
              <ul className="ml-4 list-disc space-y-1 m-0 p-0">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="ml-4 list-decimal space-y-1 m-0 p-0">{children}</ol>
            ),
          }}
        />
      )}
    </div>
  );
};

export default MessageBubble;
