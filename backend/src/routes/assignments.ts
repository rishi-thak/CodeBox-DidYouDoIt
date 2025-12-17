import express from 'express';
import { listAssignments, createAssignment } from '../controllers/assignmentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, listAssignments);
router.post('/', authenticate, createAssignment);

export default router;
