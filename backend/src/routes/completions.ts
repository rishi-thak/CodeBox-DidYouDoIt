import express from 'express';
import { listCompletions, toggleCompletion } from '../controllers/completionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, listCompletions);
router.post('/toggle', authenticate, toggleCompletion);

export default router;
