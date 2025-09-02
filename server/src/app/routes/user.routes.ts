import express from 'express';
import { getProfile, getUserTransactionHistory, transferPoints } from '../controllers/user.controller';

const router = express.Router();


router.get('/me', getProfile);
router.post('/transfer', transferPoints);
router.get('/:id/transactions', getUserTransactionHistory);

export default router;
