import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";
export type TextContent = { type: "text"; text: string };
export type ImageContent = { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };
export type FileContent = { type: "file_url"; file_url: { url: string; mime_type?: string } };
export type MessageContent = string | TextContent | ImageContent | FileContent;
export type Message = { role: Role; content: MessageContent | MessageContent[]; name?: string; tool_call_id?: string };

export type InvokeParams = {
  messages: Message[];
  maxTokens?: number;
  max_tokens?: number;
  model?: string;
  reasoning?: Record<string, unknown>;
  thinking?: Record<string, unknown>;
  // Kept for source compatibility with the old generic helper. The active Last
  // Bench product paths do not currently use tool calls or structured outputs.
  tools?: unknown[];
  toolChoice?: unknown;
  tool_choice?: unknown;
  outputSchema?: unknown;
  output_schema?: unknown;
  responseFormat?: unknown;
  response_format?: unknown;
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: { role: "assistant"; content: string };
    finish_reason: string | null;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

const RETRY_MAX_RETRIES = 4;
const RETRY_BASE_DELAY_MS = 500;
const RETRY_MAX_DELAY_MS = 30_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const at = Date.parse(value);
  return Number.isNaN(at) ? undefined : Math.max(0, at - Date.now());
};

const computeBackoffDelay = (attempt: number, retryAfterMs?: number): number => {
  const cap = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  const jittered = cap / 2 + Math.random() * (cap / 2);
  return Math.min(Math.max(jittered, retryAfterMs ?? 0), RETRY_MAX_DELAY_MS);
};

async function fetchWithBackoff(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.ok || attempt === RETRY_MAX_RETRIES) return response;
      const retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));
      await response.body?.cancel().catch(() => {});
      await sleep(computeBackoffDelay(attempt, retryAfterMs));
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_MAX_RETRIES) throw error;
      await sleep(computeBackoffDelay(attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("OpenAI request failed after retries");
}

function assertApiKey() {
  if (!ENV.openAiApiKey) throw new Error("OPENAI_API_KEY is not configured");
}

function contentToText(content: MessageContent | MessageContent[]): string {
  const parts = Array.isArray(content) ? content : [content];
  return parts
    .map((part) => {
      if (typeof part === "string") return part;
      if (part.type === "text") return part.text;
      if (part.type === "image_url") return `[Image: ${part.image_url.url}]`;
      if (part.type === "file_url") return `[File: ${part.file_url.url}]`;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function normalizeRole(role: Role): "system" | "user" | "assistant" {
  if (role === "system" || role === "assistant") return role;
  return "user";
}

type ResponsesPayload = {
  id?: string;
  created_at?: number;
  model?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
};

function extractOutputText(result: ResponsesPayload): string {
  const chunks: string[] = [];
  for (const item of result.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();
  const model = params.model || ENV.aiGuidanceModel;
  const maxOutputTokens = params.max_tokens ?? params.maxTokens;

  const payload: Record<string, unknown> = {
    model,
    input: params.messages.map((message) => ({
      role: normalizeRole(message.role),
      content: contentToText(message.content),
    })),
  };
  if (typeof maxOutputTokens === "number") payload.max_output_tokens = maxOutputTokens;
  if (params.reasoning) payload.reasoning = params.reasoning;

  const response = await fetchWithBackoff(`${ENV.openAiApiUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.openAiApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenAI request failed (${response.status})${detail ? `: ${detail.slice(0, 500)}` : ""}`);
  }

  const result = (await response.json()) as ResponsesPayload;
  const text = extractOutputText(result);
  return {
    id: result.id || crypto.randomUUID(),
    created: result.created_at || Math.floor(Date.now() / 1000),
    model: result.model || model,
    choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: "stop" }],
    usage: result.usage
      ? {
          prompt_tokens: result.usage.input_tokens ?? 0,
          completion_tokens: result.usage.output_tokens ?? 0,
          total_tokens: result.usage.total_tokens ?? 0,
        }
      : undefined,
  };
}

export type ModelInfo = { id: string; object: string; created: number; owned_by: string };
export type ModelsResponse = { object: string; data: ModelInfo[] };

export async function listLLMModels(): Promise<ModelsResponse> {
  assertApiKey();
  const response = await fetchWithBackoff(`${ENV.openAiApiUrl}/models`, {
    headers: { Authorization: `Bearer ${ENV.openAiApiKey}` },
  });
  if (!response.ok) throw new Error(`OpenAI model list failed (${response.status})`);
  return (await response.json()) as ModelsResponse;
}
