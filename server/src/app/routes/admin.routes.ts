import express from 'express';
import { createUser, deleteUser, getAllTransactions, listUsers } from '../controllers/admin.controller';
import { addPointsToUser } from '../controllers/points.controller';

const router = express.Router();


router.post('/users', createUser);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);

// Admin: Get all transactions
router.get('/transactions', getAllTransactions);

// Add points to a user
router.post('/users/add-points', addPointsToUser);

export default router;
