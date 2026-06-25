import { MiniApp } from "./app.js";

const app = new MiniApp();

app.use(async (req, _res, next) => {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;
  console.log(`${req.method} ${req.path} - ${duration}ms`);
});

app.get("/", (_req, res) => {
  res.send("Hello");
});

app.get("/users/:id", (req, res) => {
  res.json({
    id: req.params.id,
    query: req.query,
  });
});

app.post("/users", (req, res) => {
  res.status(201).json({
    message: "created",
    body: req.body,
  });
});

app.listen(3000);
