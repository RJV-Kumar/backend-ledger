const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");


app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);


module.exports = app;