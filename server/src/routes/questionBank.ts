import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  createQuestionBank, 
  getUserQuestionBanks, 
  updateQuestionBank,
  getQuestionBank,
  deleteQuestionBank,
  getPublicQuestionBanks,
  duplicateQuestionBank 
} from '../controllers/questionBankController';

const router = express.Router();

router.post('/', authenticateToken, createQuestionBank);
router.get('/', authenticateToken, getUserQuestionBanks);
router.get('/public', getPublicQuestionBanks);
router.get('/:id', authenticateToken, getQuestionBank);
router.put('/:id', authenticateToken, updateQuestionBank);
router.delete('/:id', authenticateToken, deleteQuestionBank);
router.post('/:id/duplicate', authenticateToken, duplicateQuestionBank);

export default router;