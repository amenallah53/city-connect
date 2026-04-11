const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use("/api/users", createProxyMiddleware({
  target: "http://localhost:5001",
  changeOrigin: true
}));

app.use("/api/auth", createProxyMiddleware({
  target: "http://localhost:5002",
  changeOrigin: true
}));

app.use("/api/admin", createProxyMiddleware({
  target: "http://localhost:5003",
  changeOrigin: true
}));

app.use("/api/complaints", createProxyMiddleware({
  target: "http://localhost:5004",
  changeOrigin: true
}));

app.use("/api/news", createProxyMiddleware({
  target: "http://localhost:5005",
  changeOrigin: true
}));

app.use("/api/services", createProxyMiddleware({
  target: "http://localhost:5006",
  changeOrigin: true
}));



app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.listen(5000, () => {
  console.log("Gateway running on port 5000 🚪");
});