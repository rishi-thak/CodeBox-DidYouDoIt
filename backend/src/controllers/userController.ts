import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Access denied' });
               return;
          }

          const users = await prisma.user.findMany({
               orderBy: { createdAt: 'desc' }
          });
          res.json(users);
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch users' });
     }
};
