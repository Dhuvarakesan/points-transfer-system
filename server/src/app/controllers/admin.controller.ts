import CryptoJS from 'crypto-js';
import { Request, Response } from 'express';
import Transaction from '../models/transactions.model';
import User from '../models/users.model';

const DEFAULT_PROTECTED_EMAILS = [
  'admin@admin.com', // change to your actual default admin email
  'user@user.com'    // change to your actual default user email
];

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status = 'active', points_balance = 0 } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const newUser = await User.create({
      name,
      email,
      password, // Assume password is already hashed
      role,
      status,
      points_balance,
    });

    const userObj = newUser.toJSON();
    res.status(201).json({ success: true, message: 'User created successfully.', data: userObj });
  } catch (error: any) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ success: false, message: 'Email is already registered.', error });
    }
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, message: 'Users fetched successfully.', data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (DEFAULT_PROTECTED_EMAILS.includes(user.email)) {
      return res.status(403).json({ success: false, message: 'Cannot delete default admin or user account.' });
    }
    const deleted = await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'User deleted successfully.', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

// Get all transactions for admin
const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find();

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

    res.status(200).json({ success: true, message: 'Transactions fetched successfully.', data: formattedTransactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.password) {
      // Encrypt the password before saving
      const secret = process.env.VITE_SECRET_KEY || process.env.SECRET_KEY || 'default_secret';
      updates.password = CryptoJS.AES.encrypt(updates.password, secret).toString();
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User updated successfully.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error.', error });
  }
};

export { createUser, deleteUser, getAllTransactions, listUsers, updateUser };

