import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const listGroups = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          const user = req.user!;

          if (user.role === 'BOARD_ADMIN') {
               const groups = await prisma.group.findMany({
                    include: {
                         _count: { select: { members: true } },
                         members: { include: { user: true } }
                    }
               });
               // Transform to flat structure expected by frontend
               const formattedGroups = groups.map(g => ({
                    ...g,
                    members: g.members.map(m => m.user.email)
               }));
               res.json(formattedGroups);
               return;
          }

          // Others see only their groups
          const groups = await prisma.group.findMany({
               where: {
                    members: {
                         some: { userId: user.id }
                    }
               },
               include: {
                    _count: { select: { members: true } },
                    members: { include: { user: true } }
               }
          });
          const formattedGroups = groups.map(g => ({
               ...g,
               members: g.members.map(m => m.user.email)
          }));
          res.json(formattedGroups);
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch groups' });
     }
};

export const createGroup = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Only admins can create groups' });
               return;
          }

          const { name, description } = req.body;
          const group = await prisma.group.create({
               data: { name, description }
          });

          res.json(group);
     } catch (error) {
          res.status(500).json({ error: 'Failed to create group' });
     }
};
