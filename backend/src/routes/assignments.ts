import express from 'express';
import { listAssignments, createAssignment, updateAssignment, deleteAssignment, getAssignmentStats } from '../controllers/assignmentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, listAssignments);
router.post('/', authenticate, createAssignment);
router.put('/:id', authenticate, updateAssignment);
router.delete('/:id', authenticate, deleteAssignment);
router.get('/:id/stats', authenticate, getAssignmentStats);

export default router;
