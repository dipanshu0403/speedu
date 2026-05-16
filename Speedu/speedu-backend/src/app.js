const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require('path')
const compression = require("compression");
const router = require("./router");
const bodyParser = require('body-parser')
const app = express();

app.use(express.json({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
// 
app.use(compression());

app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";

  // For multipart/form-data, let multer handle it (text fields will be in req.body)
  if (contentType.includes("multipart/form-data")) {
    return next();
  }

  if (contentType.includes("application/json")) {
    return bodyParser.json()(req, res, next);
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return bodyParser.urlencoded({ extended: true })(req, res, next);
  }

  bodyParser.json()(req, res, (err) => {
    if (err) return next(err);
    bodyParser.urlencoded({ extended: true })(req, res, next);
  });
});

// static pages start
app.get("/qr-redirect", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/qr-redirect.html"));
});

app.get("/terms&condition", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/terms&condition.html"));
});

app.get("/privacypolicies", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/privacypolicies.html"));
});



// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", router);
module.exports = app;
