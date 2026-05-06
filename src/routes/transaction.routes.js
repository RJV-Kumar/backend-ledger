const { Router } = require('express');
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const transactionRouter = Router();


/**
 * - POST /api/transactions
 * - Create a new transaction between two accounts
 * - Protected route, requires authentication
 */
transactionRouter.post("/", authMiddleware.authMiddleware, transactionController.createTransaction);


/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction for system accounts
 * - Protected route, requires authentication
 */
transactionRouter.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);
module.exports = transactionRouter;