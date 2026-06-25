import type { MiniRequest } from "./request.js";

const MAX_BODY_SIZE = 1024 * 1024;

export async function parseBody(req: MiniRequest): Promise<void> {
  if (!hasRequestBody(req.method)) {
    return;
  }

  const chunks: Buffer[] = [];
  let totalSize = 0;

  for await (const chunk of req.raw) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalSize += buffer.length;

    if (totalSize > MAX_BODY_SIZE) {
      throw new Error("Request body too large");
    }

    chunks.push(buffer);
  }

  const rawBody = Buffer.concat(chunks).toString("utf-8");
  req.rawBody = rawBody;

  if (rawBody.length === 0) {
    req.body = undefined;
    return;
  }

  const contentType = req.header("content-type") ?? "";

  if (contentType.includes("application/json")) {
    req.body = JSON.parse(rawBody);
    return;
  }

  if (contentType.includes("text/plain")) {
    req.body = rawBody;
    return;
  }

  req.body = rawBody;
}

function hasRequestBody(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
}
