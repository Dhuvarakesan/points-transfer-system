import { Request, Response } from 'express';
import User from '../models/users.model';

// Add points to a user
const addPointsToUser = async (req: Request, res: Response) => {
  try {
    const { userId, points } = req.body;

    if (!userId || points === undefined) {
      return res.status(400).json({ success: false, message: 'User ID and points are required.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.points_balance += points;
    await user.save();

    res.status(200).json({ success: true, message: 'Points added successfully.', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error.', error });
  }
};

export { addPointsToUser };
