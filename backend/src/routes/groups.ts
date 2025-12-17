import express from 'express';
import { listGroups, createGroup, updateGroup, deleteGroup } from '../controllers/groupController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, listGroups);
router.post('/', authenticate, createGroup);
router.put('/:id', authenticate, updateGroup);
router.delete('/:id', authenticate, deleteGroup);

export default router;
