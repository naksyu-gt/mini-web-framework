import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { MiniRequest } from "./request.js";
import { MiniResponse } from "./response.js";
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

    const route = this.routes.find((route) => {
      return route.method === req.method && route.path === req.path;
    });

    if (!route) {
      res.status(404).send("Not Found");
      return;
    }

    await route.handler(req, res);
  }
}
