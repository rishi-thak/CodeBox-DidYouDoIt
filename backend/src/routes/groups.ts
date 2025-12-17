import express from 'express';
import { listGroups, createGroup } from '../controllers/groupController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, listGroups);
router.post('/', authenticate, createGroup);

export default router;
