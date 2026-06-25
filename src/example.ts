import { MiniApp } from "./app.js";

const app = new MiniApp();

app.get("/", (_req, res) => {
  res.send("Hello from MiniApp");
});

app.get("/json", (_req, res) => {
  res.json({
    message: "Hello JSON",
  });
});

app.listen(3000);
