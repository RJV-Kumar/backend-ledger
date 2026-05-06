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

module.exports = router;