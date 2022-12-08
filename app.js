const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const qrRouter = require("./routes/qrRoutes");
const cookies = require("cookie-parser");

const app = express();
app.use(cors());
app.use(cookies());

// Body parser, reading data from body into req.body
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

app.use(
  express.json({
    limit: "100mb",
  })
);

app.use(bodyParser.urlencoded({ extended: false, limit: "10kb" }));

// app.use(express.urlencoded({ extended: true,  }));

// Serving static files
app.use(express.static(`${__dirname}/client`));

// 3) ROUTES
app.use("/api/users", userRouter);
app.use("/api/product", productRouter);
app.use("/api/qr", qrRouter);

app.all("/*", (req, res, next) => {
  res.sendFile(path.join(`${__dirname}/client/index.html`));
});

module.exports = app;
