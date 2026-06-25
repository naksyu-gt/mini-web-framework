import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { parseBody } from "./body.js";
import { MiniRequest } from "./request.js";
import { MiniResponse } from "./response.js";
import { matchPath } from "./router.js";
import type {
  ErrorHandler,
  Handler,
  HttpMethod,
  Middleware,
  Route,
} from "./types.js";

export class MiniApp {
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];

  private errorHandler: ErrorHandler = (error, _req, res) => {
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  };

  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  onError(handler: ErrorHandler): void {
    this.errorHandler = handler;
  }

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

      const matchedRoute = this.findRoute(req);

      if (!matchedRoute) {
        res.status(404).json({
          error: "Not Found",
        });
        return;
      }

      req.params = matchedRoute.params;

      await this.runMiddlewares(req, res, matchedRoute.route.handler);

      if (!res.raw.writableEnded) {
        res.end();
      }
    } catch (error) {
      await this.errorHandler(error, req, res);
    }
  }

  private findRoute(
    req: MiniRequest,
  ): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== req.method) {
        continue;
      }

      const matched = matchPath(route.path, req.path);

      if (!matched) {
        continue;
      }

      return {
        route,
        params: matched.params,
      };
    }

    return null;
  }

  private async runMiddlewares(
    req: MiniRequest,
    res: MiniResponse,
    handler: Handler,
  ): Promise<void> {
    const routeMiddleware: Middleware = async (req, res) => {
      await handler(req, res);
    };

    const stack = [...this.middlewares, routeMiddleware];

    let currentIndex = -1;

    const dispatch = async (index: number): Promise<void> => {
      if (index <= currentIndex) {
        throw new Error("next() called multiple times");
      }

      currentIndex = index;

      const middleware = stack[index];

      if (!middleware) {
        return;
      }

      await middleware(req, res, () => dispatch(index + 1));
    };

    await dispatch(0);
  }
}
