const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRouter = require("./routes/transaction.routes");


app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Ledger Server is up and running"
    })
})

module.exports = app;