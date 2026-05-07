const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");


/**
 * - POST /api/accounts
 * - Create a new bank account for the authenticated user
 * - Protected route, requires authentication
 */
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController);

/**
 * - GET /api/accounts
 * - Get a list of all bank accounts for the authenticated user
 */
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController)

/**
 * - GET /api/accounts/balance/:accountId
 * - Get the current balance of a specific account
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)

module.exports = router;