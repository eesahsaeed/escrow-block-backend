
const mongoose = require("mongoose");

const TransactionSchema = mongoose.Schema({
  bankName: {
    type: String
  },
  accountNumber: {
    type: String
  },
  fullFormat: {
    type: String
  },
  accountName: {
    type: String
  },
  sortCode: {
    type: String
  },
  otherDetails: {
    type: String
  },
  bitcoinAmount: {
    type: Number,
    required: "Bitcoin Amount is required"
  },
  paymentAmount: {
    type: Number,
    required: "Payment Amount is required"
  },
  walletAddress: {
    type: String
  },
  currency: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: "Status is required"
  },
  owner: {type: mongoose.Schema.ObjectId, ref: "User"},
  date: {
    type: Date,
    default: Date.now
  },
  transactionType: {
    type: String,
    required: "Transaction type is required"
  }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
