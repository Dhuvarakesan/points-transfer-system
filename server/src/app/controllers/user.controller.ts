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
    }).populate('sender_id receiver_id');
    res.status(200).json({ success: true, message: 'User transactions fetched successfully.', data: transactions });
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

    res.status(200).json({ success: true, message: 'Points transferred successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

export { getProfile, getUserTransactionHistory, transferPoints };

