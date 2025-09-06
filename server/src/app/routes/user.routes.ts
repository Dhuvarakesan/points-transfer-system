import express from 'express';
import { getProfile, getUserPointBalance, getUserTransactionHistory, transferPoints } from '../controllers/user.controller';

const router = express.Router();

router.get('/me', getProfile);
router.post('/transfer', transferPoints);
router.get('/:id/transactions', getUserTransactionHistory);
// Get user point balance
router.get('/:id/points', getUserPointBalance);

export default router;
