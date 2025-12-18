import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const listCompletions = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          const user = req.user!;
          // Return completions for the logged-in user
          const completions = await prisma.completion.findMany({
               where: { userId: user.id }
          });
          res.json(completions.map(c => ({
               id: c.id,
               assignmentId: c.assignmentId,
               userEmail: user.email,
               completedAt: c.completedAt
          })));
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch completions' });
     }
};

export const toggleCompletion = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          const user = req.user!;
          const { assignmentId } = req.body;

          if (!assignmentId) {
               res.status(400).json({ error: 'Assignment ID required' });
               return;
          }

          const existing = await prisma.completion.findUnique({
               where: {
                    userId_assignmentId: {
                         userId: user.id,
                         assignmentId
                    }
               }
          });

          if (existing) {
               await prisma.completion.delete({
                    where: { id: existing.id }
               });
               res.json({ completed: false });
          } else {
               await prisma.completion.create({
                    data: {
                         userId: user.id,
                         assignmentId
                    }
               });
               res.json({ completed: true });
          }
     } catch (error) {
          res.status(500).json({ error: 'Failed to toggle completion' });
     }
};
