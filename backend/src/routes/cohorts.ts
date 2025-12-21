import express from 'express';
import { authenticate } from '../middleware/auth';
import { listCohorts, createCohort, updateCohort, deleteCohort } from '../controllers/cohortController';

const router = express.Router();

router.get('/', authenticate, listCohorts);
router.post('/', authenticate, createCohort);
router.put('/:id', authenticate, updateCohort);
router.delete('/:id', authenticate, deleteCohort);

export default router;
