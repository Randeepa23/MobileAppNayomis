const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'refund', 'topup'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  previousBalance: {
    type: Number,
    required: true
  },
  newBalance: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'completed'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

transactionSchema.index({ student: 1, createdAt: -1 });
transactionSchema.index({ orderId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
