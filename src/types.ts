import type { MiniResponse } from "./response.js";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export type Handler = (req: unknown, res: MiniResponse) => void | Promise<void>;

export type Route = {
  method: HttpMethod;
  path: string;
  handler: Handler;
};
