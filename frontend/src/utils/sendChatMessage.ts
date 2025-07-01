interface SendChatOptions {
  message: string;
  agentKey?: string | null;
  orgId: string;
  onStream: (chunk: string) => void;
}

const BACKEND_URL = import.meta.env.VITE_API_URL;

export async function sendChatMessage({
  message,
  agentKey,
  orgId,
  onStream,
}: SendChatOptions): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-org-id": orgId,
    },
    body: JSON.stringify({
      message,
      ...(agentKey ? { agent_key: agentKey } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`[Server error] ${errorText || "Unknown error"}`);
  }

  if (!response.body) {
    throw new Error("[Server error] No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  try {
    let done = false;
    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        onStream(chunk);
      }
    }
  } catch (err) {
    console.error("❌ Stream error:", err);
    throw new Error("[Server error] Stream interrupted");
  }
}
