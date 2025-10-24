import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getUserStats, 
  getGameAnalytics 
} from '../controllers/analyticsController';

const router = express.Router();

router.get('/stats', authenticateToken, getUserStats);
router.get('/games/:gameId', authenticateToken, getGameAnalytics);

export default router;