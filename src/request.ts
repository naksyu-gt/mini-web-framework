import type { IncomingMessage } from "node:http";

export class MiniRequest {
  public readonly method: string;
  public readonly url: URL;
  public readonly path: string;
  public readonly query: Record<string, string | string[]>;
  public params: Record<string, string> = {};
  public body: unknown = undefined;
  public rawBody = "";

  constructor(public readonly raw: IncomingMessage) {
    this.method = raw.method ?? "GET";

    this.url = new URL(
      raw.url ?? "/",
      `http://${raw.headers.host ?? "localhost"}`,
    );

    this.path = this.url.pathname;
    this.query = this.parseQuery(this.url);
  }

  header(name: string): string | undefined {
    const value = this.raw.headers[name.toLowerCase()];

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return value;
  }

  private parseQuery(url: URL): Record<string, string | string[]> {
    const result: Record<string, string | string[]> = {};

    for (const [key, value] of url.searchParams.entries()) {
      const current = result[key];

      if (current === undefined) {
        result[key] = value;
      } else if (Array.isArray(current)) {
        current.push(value);
      } else {
        result[key] = [current, value];
      }
    }

    return result;
  }
}
