import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { parseBody } from "./body.js";
import { MiniRequest } from "./request.js";
import { MiniResponse } from "./response.js";
import { matchPath } from "./router.js";
import type { Handler, HttpMethod, Route } from "./types.js";

export class MiniApp {
  private routes: Route[] = [];

  get(path: string, handler: Handler): void {
    this.routes.push({
      method: "GET",
      path,
      handler,
    });
  }

  post(path: string, handler: Handler): void {
    this.routes.push({
      method: "POST",
      path,
      handler,
    });
  }

  put(path: string, handler: Handler): void {
    this.routes.push({
      method: "PUT",
      path,
      handler,
    });
  }

  delete(path: string, handler: Handler): void {
    this.routes.push({
      method: "DELETE",
      path,
      handler,
    });
  }

  listen(port: number): void {
    const server = createServer((rawReq, rawRes) => {
      void this.handle(rawReq, rawRes);
    });

    server.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  }

  private async handle(
    rawReq: IncomingMessage,
    rawRes: ServerResponse,
  ): Promise<void> {
    const req = new MiniRequest(rawReq);
    const res = new MiniResponse(rawRes);

    try {
      await parseBody(req);

      for (const route of this.routes) {
        if (route.method !== req.method) {
          continue;
        }

        const matched = matchPath(route.path, req.path);

        if (!matched) {
          continue;
        }

        req.params = matched.params;
        await route.handler(req, res);
        return;
      }

      res.status(404).send("Not Found");
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
