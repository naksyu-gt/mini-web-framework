import { MiniApp } from "./app.js";

const app = new MiniApp();

app.get("/", (req, res) => {
  res.json({
    method: req.method,
    path: req.path,
    query: req.query,
  });
});

app.listen(3000);
