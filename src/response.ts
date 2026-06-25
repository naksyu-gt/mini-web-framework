import type { ServerResponse } from "node:http";

export class MiniResponse {
  constructor(public readonly raw: ServerResponse) {}

  status(code: number): this {
    this.raw.statusCode = code;
    return this;
  }

  set(name: string, value: string): this {
    this.raw.setHeader(name, value);
    return this;
  }

  send(body: string | Buffer | object): void {
    if (this.raw.writableEnded) {
      return;
    }

    if (typeof body === "object" && !Buffer.isBuffer(body)) {
      this.json(body);
      return;
    }

    if (!this.raw.hasHeader("Content-Type")) {
      this.raw.setHeader("Content-Type", "text/plain; charset=utf-8");
    }

    this.raw.end(body);
  }

  json(data: unknown): void {
    if (this.raw.writableEnded) {
      return;
    }

    const body = JSON.stringify(data);

    this.raw.setHeader("Content-Type", "application/json; charset=utf-8");
    this.raw.end(body);
  }

  end(): void {
    if (!this.raw.writableEnded) {
      this.raw.end();
    }
  }
}
