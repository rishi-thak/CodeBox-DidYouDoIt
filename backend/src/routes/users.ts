import express from 'express';
import { listUsers, createUser, updateUser, deleteUsers } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, listUsers);
router.post('/', authenticate, createUser);
router.put('/:id', authenticate, updateUser);
router.delete('/', authenticate, deleteUsers);
router.post('/delete-many', authenticate, deleteUsers); // Alternative endpoint

export default router;
