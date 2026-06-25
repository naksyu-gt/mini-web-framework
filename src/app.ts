import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
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
    const method = rawReq.method as HttpMethod;
    const url = new URL(
      rawReq.url ?? "/",
      `http://${rawReq.headers.host ?? "localhost"}`,
    );

    const res = new MiniResponse(rawRes);

    const route = this.routes.find((route) => {
      return route.method === method && route.path === url.pathname;
    });

    if (!route) {
      res.status(404).send("Not Found");
      return;
    }

    await route.handler(rawReq, res);
  }
}
