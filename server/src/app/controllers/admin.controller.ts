import { Request, Response } from 'express';
import Transaction from '../models/transactions.model';
import User from '../models/users.model';

const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status = 'active', points = 0 } = req.body;

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
      points,
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
    const deleted = await User.findByIdAndDelete(id);
    if (deleted) {
      res.status(200).json({ success: true, message: 'User deleted successfully.', data: deleted });
    } else {
      res.status(404).json({ success: false, message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

// Get all transactions for admin
const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find().populate('sender_id receiver_id');
    res.status(200).json({ success: true, message: 'Transactions fetched successfully.', data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error });
  }
};

export { createUser, deleteUser, getAllTransactions, listUsers };

