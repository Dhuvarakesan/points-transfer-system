import { Request, Response } from 'express';
import Transaction from '../models/transactions.model';
import User from '../models/users.model';
// Get transactions for the logged-in user
const getUserTransactionHistory = async (req: Request, res: Response) => {
  try {
    if (!req.params || !req.params.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const userId = req.params.id;
    const transactions = await Transaction.find({
      $or: [
        { sender_id: userId },
        { receiver_id: userId }
      ]
    });

    const formattedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const sender = await User.findById(transaction.sender_id);
        const receiver = await User.findById(transaction.receiver_id);

        return {
          _id: transaction._id,
          senderId: transaction.sender_id,
          senderName: sender ? sender.name : 'Unknown',
          receiverId: transaction.receiver_id,
          receiverName: receiver ? receiver.name : 'Unknown',
          amount: transaction.amount,
          timestamp: transaction.createdAt,
          status: transaction.status,
        };
      })
    );

    res.status(200).json({ success: true, message: 'User transactions fetched successfully.', data: formattedTransactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

const getProfile = async (req: Request, res: Response) => {
  try {
    // req.user should be set by authentication middleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({ success: true, message: 'Profile fetched successfully.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

const transferPoints = async (req: Request, res: Response) => {
  try {
    if (!req.body || !req.body._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const { receiverId, amount } = req.body;
    const senderId = req.body._id;
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, message: 'Sender or receiver not found.' });
    }

    if (sender.points_balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }

    sender.points_balance -= amount;
    receiver.points_balance += amount;

    await sender.save();
    await receiver.save();

    // Create a transaction record
    const transaction = new Transaction({
      sender_id: sender._id,
      receiver_id: receiver._id,
      amount,
      status: 'success',
      createdAt: new Date(),
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Points transferred successfully.',
      transaction,
    });
  } catch (error) {
    // Handle failure case
    const transaction = new Transaction({
      sender_id: req.body._id,
      receiver_id: req.body.receiverId,
      amount: req.body.amount,
      status: 'failed',
      createdAt: new Date(),
    });

    await transaction.save();

    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

export { getProfile, getUserTransactionHistory, transferPoints };

