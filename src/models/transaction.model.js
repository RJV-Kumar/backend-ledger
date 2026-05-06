const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "From account is required for a transaction"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "To account is required for a transaction"],
        index: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for a transaction"],
        min: [0.01, "Amount must be at least 0.01"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required for a transaction"],
        unique: [true, "Idempotency key must be unique for each transaction"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED"],
            message: "Status must be either PENDING, COMPLETED, or FAILED",
        },
        default: "PENDING"
    }
}, {
    timestamps: true
});

const transactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = transactionModel;
