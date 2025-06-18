interface SendChatOptions {
  message: string;
  agentKey?: string | null;
  orgId: string;
  onStream: (chunk: string) => void;
}

export async function sendChatMessage({
  message,
  agentKey,
  orgId,
  onStream,
}: SendChatOptions): Promise<void> {
  const response = await fetch("https://basecampai.ngrok.io/chat", {
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

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onStream(decoder.decode(value, { stream: true }));
  }
}
