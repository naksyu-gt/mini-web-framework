import { MiniApp } from "./app.js";

const app = new MiniApp();

app.get("/", (_req, res) => {
  res.send("Hello");
});

app.post("/users", (req, res) => {
  res.status(201).json({
    message: "created",
    body: req.body,
  });
});

app.listen(3000);
