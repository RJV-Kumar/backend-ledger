const express = require('express');
const authRouter = require("./routes/auth.routes");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser());

app.use("/api/auth", authRouter);


module.exports = app;