const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorBody {
  error?: { message?: string; details?: { field?: string; message: string }[] };
}

export async function sendChatMessage(username: string, message: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/chat/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, message }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The server took too long to respond. Please try again.");
    }
    throw new ApiError("Cannot reach the server. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }

  if (response.ok) return;

  let body: ErrorBody | null = null;
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    // non-JSON error body
  }

  const detail = body?.error?.details?.[0]?.message;
  const fallback =
    response.status >= 500
      ? "The server ran into a problem. Please try again."
      : "Unable to send message.";
  throw new ApiError(detail ?? body?.error?.message ?? fallback, response.status);
}
