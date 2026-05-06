const { Router } = require('express');
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const transactionRouter = Router();


/**
 * - POST /api/transactions
 * - Create a new transaction between two accounts
 * - Protected route, requires authentication
 */
transactionRouter.post("/", authMiddleware.authMiddleware, transactionController.createTransactionController);

module.exports = transactionRouter;