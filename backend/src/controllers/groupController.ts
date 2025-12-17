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

          const { name, description, members } = req.body; // members is list of emails optional

          let userIds: string[] = [];
          if (members && members.length > 0) {
               const users = await prisma.user.findMany({
                    where: { email: { in: members } },
                    select: { id: true }
               });
               userIds = users.map(u => u.id);
          }

          const group = await prisma.group.create({
               data: {
                    name,
                    description,
                    members: {
                         create: userIds.map(uid => ({
                              user: { connect: { id: uid } }
                         }))
                    }
               }
          });

          res.json(group);
     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to create group' });
     }
};

export const updateGroup = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Only admins can update groups' });
               return;
          }

          const { id } = req.params;
          const { name, description, members } = req.body; // members is list of emails

          // Handle members update if provided
          if (members) {
               // Find users by email
               const users = await prisma.user.findMany({
                    where: { email: { in: members } }
               });

               // Transactional update
               await prisma.$transaction(async (tx) => {
                    await tx.group.update({
                         where: { id },
                         data: { name, description }
                    });

                    // Sync members: Delete all existing, add new list
                    // This is "Nuclear" approach but simple for MVP list editing
                    await tx.userGroup.deleteMany({ where: { groupId: id } });

                    if (users.length > 0) {
                         await tx.userGroup.createMany({
                              data: users.map(u => ({
                                   userId: u.id,
                                   groupId: id
                              }))
                         });
                    }
               });
          } else {
               await prisma.group.update({
                    where: { id },
                    data: { name, description }
               });
          }

          res.json({ success: true });
     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update group' });
     }
};

export const deleteGroup = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Only admins can delete groups' });
               return;
          }
          const { id } = req.params;
          await prisma.group.delete({ where: { id } });
          res.json({ success: true });
     } catch (error) {
          res.status(500).json({ error: 'Failed to delete group' });
     }
};
