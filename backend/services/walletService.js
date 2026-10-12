const Student = require('../models/Student');
const Transaction = require('../models/Transaction');
const EventLog = require('../models/EventLog');

/**
 * Wallet & Payment Service
 * Handles credit-based payment system
 */
class WalletService {

  /**
   * Check if student has sufficient balance
   */
  async checkBalance(studentId, amount) {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const balance = student.wallet?.balance || 0;
      return {
        hasBalance: balance >= amount,
        currentBalance: balance,
        required: amount,
        shortfall: Math.max(0, amount - balance)
      };
    } catch (error) {
      throw new Error(`Balance check failed: ${error.message}`);
    }
  }

  /**
   * Deduct amount from wallet (for order payment)
   */
  async deductPayment(studentId, amount, orderId, description = 'Order payment') {
    const session = await Student.startSession();
    session.startTransaction();

    try {
      const student = await Student.findById(studentId).session(session);
      if (!student) {
        throw new Error('Student not found');
      }

      const currentBalance = student.wallet?.balance || 0;
      
      if (currentBalance < amount) {
        throw new Error(`Insufficient balance. Available: Rs.${currentBalance}, Required: Rs.${amount}`);
      }

      const newBalance = currentBalance - amount;

      // Update wallet balance
      await Student.findByIdAndUpdate(
        studentId,
        { 'wallet.balance': newBalance },
        { session, new: true }
      );

      // Create transaction record
      const transaction = await Transaction.create([{
        student: studentId,
        type: 'debit',
        amount: amount,
        previousBalance: currentBalance,
        newBalance: newBalance,
        description: description,
        orderId: orderId,
        status: 'completed'
      }], { session });

      // Log event
      await EventLog.create([{
        eventType: 'payment_success',
        severity: 'info',
        entityType: 'payment',
        entityId: transaction[0]._id,
        userId: studentId,
        message: `Payment of Rs.${amount} deducted successfully`,
        details: {
          amount,
          previousBalance: currentBalance,
          newBalance: newBalance,
          orderId: orderId
        }
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        transaction: transaction[0],
        newBalance: newBalance
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // Log failed payment
      await EventLog.create({
        eventType: 'payment_failed',
        severity: 'error',
        entityType: 'payment',
        entityId: studentId,
        userId: studentId,
        message: `Payment failed: ${error.message}`,
        details: { amount, orderId, error: error.message }
      });

      throw error;
    }
  }

  /**
   * Add credits to wallet (top-up)
   */
  async topUpWallet(studentId, amount, description = 'Wallet top-up') {
    const session = await Student.startSession();
    session.startTransaction();

    try {
      const student = await Student.findById(studentId).session(session);
      if (!student) {
        throw new Error('Student not found');
      }

      const currentBalance = student.wallet?.balance || 0;
      const newBalance = currentBalance + amount;

      // Update wallet balance
      await Student.findByIdAndUpdate(
        studentId,
        { 'wallet.balance': newBalance },
        { session, new: true }
      );

      // Create transaction record
      const transaction = await Transaction.create([{
        student: studentId,
        type: 'topup',
        amount: amount,
        previousBalance: currentBalance,
        newBalance: newBalance,
        description: description,
        status: 'completed'
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        transaction: transaction[0],
        newBalance: newBalance
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Issue refund (e.g., cancelled order)
   */
  async issueRefund(studentId, amount, orderId, reason = 'Order cancelled') {
    const session = await Student.startSession();
    session.startTransaction();

    try {
      const student = await Student.findById(studentId).session(session);
      if (!student) {
        throw new Error('Student not found');
      }

      const currentBalance = student.wallet?.balance || 0;
      const newBalance = currentBalance + amount;

      // Update wallet balance
      await Student.findByIdAndUpdate(
        studentId,
        { 'wallet.balance': newBalance },
        { session, new: true }
      );

      // Create transaction record
      const transaction = await Transaction.create([{
        student: studentId,
        type: 'refund',
        amount: amount,
        previousBalance: currentBalance,
        newBalance: newBalance,
        description: reason,
        orderId: orderId,
        status: 'completed'
      }], { session });

      // Log event
      await EventLog.create([{
        eventType: 'refund_issued',
        severity: 'info',
        entityType: 'payment',
        entityId: transaction[0]._id,
        userId: studentId,
        message: `Refund of Rs.${amount} issued: ${reason}`,
        details: {
          amount,
          previousBalance: currentBalance,
          newBalance: newBalance,
          orderId: orderId,
          reason
        }
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        transaction: transaction[0],
        newBalance: newBalance
      };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(studentId, limit = 50) {
    try {
      const transactions = await Transaction.find({ student: studentId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('orderId', 'total status deliveryDate');

      return transactions;
    } catch (error) {
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }
  }

  /**
   * Get wallet summary
   */
  async getWalletSummary(studentId) {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const transactions = await Transaction.find({ student: studentId });
      
      const summary = {
        currentBalance: student.wallet?.balance || 0,
        totalTopUps: 0,
        totalSpent: 0,
        totalRefunds: 0,
        transactionCount: transactions.length
      };

      transactions.forEach(tx => {
        if (tx.type === 'topup') summary.totalTopUps += tx.amount;
        if (tx.type === 'debit') summary.totalSpent += tx.amount;
        if (tx.type === 'refund') summary.totalRefunds += tx.amount;
      });

      return summary;
    } catch (error) {
      throw new Error(`Failed to get wallet summary: ${error.message}`);
    }
  }
}

module.exports = new WalletService();
