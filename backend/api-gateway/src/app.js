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


app.use("/api/news-service", createProxyMiddleware({
  target: "http://localhost:5005",
  changeOrigin: true
}));

app.use("/api/services", createProxyMiddleware({
  target: "http://localhost:5006",
  changeOrigin: true,
  pathRewrite: {
    "^(.*)$": "/api/services$1"
  }
}));

app.use("/api/faqs", createProxyMiddleware({
  target: "http://localhost:5007",
  changeOrigin: true
}));

app.use("/api/tickets", createProxyMiddleware({
  target: "http://localhost:5004",
  changeOrigin: true
}));

app.use("/api/uploads", createProxyMiddleware({
  target: "http://localhost:5010",
  changeOrigin: true
}));



app.use("/api/myprofile", createProxyMiddleware({
  target: "http://localhost:5008",
  changeOrigin: true
}));

app.use("/api/users-service-admin", createProxyMiddleware({
  target: "http://localhost:5009",
  changeOrigin: true
}));

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.listen(5000, () => {
  console.log("Gateway running on port 5000 🚪");
});