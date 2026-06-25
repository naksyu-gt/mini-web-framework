import { MiniApp } from "./app.js";

const app = new MiniApp();

app.use(async (req, _res, next) => {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;
  console.log(`${req.method} ${req.path} - ${duration}ms`);
});

app.onError((error, _req, res) => {
  console.error(error);

  res.status(500).json({
    error: "Something went wrong",
  });
});

app.get("/", (_req, res) => {
  res.send("Hello");
});

app.get("/error", () => {
  throw new Error("Test error");
});

app.listen(3000);
