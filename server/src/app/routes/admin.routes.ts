import express from 'express';
import { createUser, deleteUser, getAllTransactions, listUsers, updateUser } from '../controllers/admin.controller';
import { addNOXToUser } from '../controllers/points.controller';

const router = express.Router();


router.post('/users', createUser);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);

// Admin: Get all transactions
router.get('/transactions', getAllTransactions);

// Add NOX to a user
router.post('/users/add-nox', addNOXToUser);

export default router;
