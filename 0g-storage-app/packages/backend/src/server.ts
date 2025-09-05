import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("0G Storage Backend is running 🚀");
});

app.listen(4000, () => {
  console.log("Backend listening on port 4000");
});
