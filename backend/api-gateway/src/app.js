const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON
app.use(express.json());

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
  target: "http://localhost:3004",
  changeOrigin: true,
  pathRewrite: {
    "^(.*)$": "/api/services$1"
  }
}));



app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.listen(5000, () => {
  console.log("Gateway running on port 5000 🚪");
});