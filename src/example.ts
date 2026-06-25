import { createServer } from "node:http";

const server = createServer((req, res) => {
  console.log("method:", req.method);
  console.log("url:", req.url);
  console.log("headers:", req.headers);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Hello from raw Node.js HTTP server");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
