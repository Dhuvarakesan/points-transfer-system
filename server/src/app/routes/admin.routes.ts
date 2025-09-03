import express from 'express';
import { createUser, deleteUser, getAllTransactions, listUsers } from '../controllers/admin.controller';

const router = express.Router();


router.post('/users', createUser);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);

// Admin: Get all transactions
router.get('/transactions', getAllTransactions);

export default router;
