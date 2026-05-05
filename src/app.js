const express = require('express');
const authRouter = require("./routes/auth.routes");
const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies

app.use("/api/auth", authRouter);


module.exports = app;