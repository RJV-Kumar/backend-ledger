const transactionModel = require("../models/transaction.model");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/** 
 * The 10-step Transfer flow:
 * 1. Validate required fields (fromAccount, toAccount, amount, idempotencyKey)
 * 2. Validate idempotency key to prevent duplicate transactions   
 * 3. Check account status of both fromAccount and toAccount, both must be ACTIVE
 * 4. Check sufficient balance in fromAccount
 * 5. Create transaction with PENDING status
 * 6. Create DEBIT ledger entry for fromAccount 
 * 7. Create CREDIT ledger entry for toAccount
 * 8. Update transaction status to COMPLETED
 * 9. Commit transaction to database
 * 10. Send Email notification
 * /
/**
 * - Controller for creating a new transaction
 * - POST /api/transactions
 * - Protected route, requires authentication
 */
async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    // 1. Validate required fields
    if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields: fromAccount, toAccount, amount, idempotencyKey",
            status: "fail"
        })
    }
    const fromAccountUser = await accountModel.findOne({
        _id: fromAccount,
    });
    const toAccountUser = await accountModel.findOne({
        _id: toAccount,
    });
    if(!fromAccountUser || !toAccountUser) {
        return res.status(404).json({
            message: "Invalid fromAccount or toAccount, account not found",
            status: "fail"
        })
    }

    // 2. Validate idempotency key
    const isTransactionAlreadyCreated = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    })
    if(isTransactionAlreadyCreated) {
        if(isTransactionAlreadyCreated.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction with this idempotency key already exists and is completed",
                status: "success",
                transaction: isTransactionAlreadyCreated
            })
        } else if(isTransactionAlreadyCreated.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction with this idempotency key already exists and is pending",
            })
        } else if(isTransactionAlreadyCreated.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction with this idempotency key already exists and has reversed",
                status: "fail",
            })
        } else if(isTransactionAlreadyCreated.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction with this idempotency key already exists and has failed",
                status: "fail"
            })
        }
    }

    // 3. Check account status
    if(fromAccountUser.status !== "ACTIVE" || toAccountUser.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process a transaction",
            status: "fail"
        })
    }

    // 4. Check sufficient balance in fromAccount
    const fromAccBalance = await fromAccountUser.getBalance();
    if(fromAccBalance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. 
                    Current balance in fromAccount is ${fromAccBalance}. 
                    Requested amount is ${amount}`,
        })
    }
    

    let transaction; // declaring transaction variable to be used later for response after successful transaction completion
    try {

        // starting a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        // 5. Create transaction with PENDING status
        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0] // getting the created transaction from the array

        // 6. Create DEBIT ledger entry for fromAccount
        const debitEntry = await ledgerModel.create([{
            account: fromAccount,
            type: "DEBIT",
            amount,
            transaction: transaction._id
        }], { session })

        // await (() => {
        //     return new Promise((resolve) => setTimeout(resolve, 100*1000))
        // })()

        // 7. Create CREDIT ledger entry for toAccount
        const creditEntry = await ledgerModel.create([{
            account: toAccount,
            type: "CREDIT",
            amount,
            transaction: transaction._id
        }], { session })

        // 8. Update transaction status to COMPLETED
        await transactionModel.findOneAndUpdate(
            { _id: transaction._id}, 
            { status: "COMPLETED"}, 
            { session }
        )

        // 9. Commit transaction to database
        await session.commitTransaction();
        session.endSession(); // ending the session
    } catch (error) {
        return res.status(400).json({
            message: "Transaction is in PENDING state due to an error during processing. Please try again later.",
            error: error.message,
        })
    }

    // 10. Send Email notification to both account holders about the transaction
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);
    
    return res.status(201).json({
        message: "Transaction completed successfully",
        status: "success",
        transaction
    })
}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    // 1. Validate required fields
    if(!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Missing required fields: toAccount, amount, idempotencyKey",
            status: "fail"
        })
    }

    const toAccountUser = await accountModel.findOne({
        _id: toAccount,
    });
    if(!toAccountUser) {
        return res.status(404).json({
            message: "Invalid toAccount, account not found",
            status: "fail"
        })
    }

    const fromAccount = await accountModel.findOne({
        //systemUser: true,
        user: req.user._id
    })
    if(!fromAccount) {
        return res.status(404).json({
            message: "System account not found for the user",
            status: "fail"
        })
    }

    let transaction;
    try{
        const session = await mongoose.startSession();
        session.startTransaction();

        transaction = (await transactionModel.create([{
            fromAccount: fromAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        const debitEntry = await ledgerModel.create([{
            account: fromAccount._id,
            type: "DEBIT",
            amount,
            transaction: transaction._id
        }], { session })

        const creditEntry = await ledgerModel.create([{
            account: toAccount,
            type: "CREDIT",
            amount,
            transaction: transaction._id
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id}, 
            { status: "COMPLETED"}, 
            { session }
        )

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        return res.status(400).json({
            message: "Initial funds transaction is in PENDING state due to an error during processing. Please try again later.",
            error: error.message,
        })
    }

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        status: "success",
        transaction
    })
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}