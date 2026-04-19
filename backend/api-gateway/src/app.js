const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Enable CORS for all routes
app.use(cors());

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

app.use("/api/tickets", createProxyMiddleware({
  target: "http://localhost:5004",
  changeOrigin: true
}));


app.use("/api/news-service", createProxyMiddleware({
  target: "http://localhost:5014",
  changeOrigin: true,
  pathRewrite: { "^/api/news-service": "" }
}));

app.use("/api/news", createProxyMiddleware({
  target: "http://localhost:5013",
  changeOrigin: true,
  pathRewrite: {
    "^(.*)$": "/api/news$1"
  }
}));

app.use("/api/services", createProxyMiddleware({
  target: "http://localhost:5006",
  changeOrigin: true,
  pathRewrite: {
    "^(.*)$": "/api/services$1"
  }
}));

app.use("/api/service-requests", createProxyMiddleware({
  target: "http://localhost:5006",
  changeOrigin: true,
  pathRewrite: {
    "^(.*)$": "/api/service-requests$1"
  }
}));

app.use("/api/offers", createProxyMiddleware({
  target: "http://localhost:5011",
  changeOrigin: true,
  pathRewrite: {
    "^(.*)$": "/api/offers$1"
  }
}));

app.use("/api/prestataires", createProxyMiddleware({
  target: "http://localhost:5012",
  changeOrigin: true,
  pathRewrite: {
    "^(.*)$": "/api/prestataires$1"
  }
}));

app.use("/api/faqs", createProxyMiddleware({
  target: "http://localhost:5007",
  changeOrigin: true
}));


/*app.use("/api/myprofile", createProxyMiddleware({
  target: "http://localhost:5008",
  changeOrigin: true
}));*/

// Removed /api/myprofile as it is decommissioned in favor of users-service-admin

app.use("/api/users-service-admin", createProxyMiddleware({
  target: "http://localhost:5009",
  changeOrigin: true
}));


app.use("/api/uploads", createProxyMiddleware({
  target: "http://localhost:5010",
  changeOrigin: true,
  xfwd: true,
  pathRewrite: (path) => `/api/uploads${path === "/" ? "" : path}`
}));

// Backward compatibility for previously stored local-media URLs.
app.use("/uploads", createProxyMiddleware({
  target: "http://localhost:5010",
  changeOrigin: true,
  pathRewrite: (path) => `/uploads${path === "/" ? "" : path}`
}));

app.use("/api/schedules", createProxyMiddleware({
  target: "http://localhost:5015",
  changeOrigin: true
}));



app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.listen(5000, () => {
  console.log("Gateway running on port 5000 🚪");
});