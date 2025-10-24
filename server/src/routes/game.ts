import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  createGameSession, 
  joinGameSession, 
  getGameSession, 
  startGame,
  endGame,
  getGameResults 
} from '../controllers/gameController';

const router = express.Router();

router.post('/create', authenticateToken, createGameSession);
router.post('/join', joinGameSession);
router.get('/:pin', getGameSession);
router.post('/:pin/start', authenticateToken, startGame);
router.post('/:pin/end', authenticateToken, endGame);
router.get('/:pin/results', getGameResults);

export default router;