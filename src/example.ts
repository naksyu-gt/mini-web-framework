import { MiniApp } from "./app.js";

const app = new MiniApp();

app.get("/", (_req, res) => {
  res.send("Hello");
});

app.get("/users/:id", (req, res) => {
  res.json({
    id: req.params.id,
    query: req.query,
  });
});

app.listen(3000);
