const mongooese = require('mongoose');

const ledgerSchema = new mongooese.Schema({
    account: {
        type: mongooese.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Ledger entry must be associated with an account"],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for a ledger entry"],
        min: [0.01, "Amount must be at least 0.01"],
        immutable: true
    },
    transaction: {
        type: mongooese.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Ledger entry must be associated with a transaction"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["DEBIT", "CREDIT"],
            message: "Type must be either DEBIT or CREDIT",
        },
    }
});

function preventLedgerModification() {
    throw new Error("Ledger entries cannot be modified after creation");
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);

const ledgerModel = mongooese.model("Ledger", ledgerSchema);
module.exports = ledgerModel;