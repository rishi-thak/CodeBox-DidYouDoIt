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

          const { name, description, members, cohortId } = req.body; // members is list of emails optional

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
                    cohortId, // Optional
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
          const { name, description, members, cohortId } = req.body; // members is list of emails

          // Handle members update if provided
          if (members) {
               // 1. Resolve emails to User IDs
               const users = await prisma.user.findMany({
                    where: { email: { in: members } },
                    select: { id: true, email: true }
               });

               const foundEmails = new Set(users.map(u => u.email));
               const foundUserIds = new Set(users.map(u => u.id));

               // Optional: Log or return warning about missing emails
               // const missingEmails = members.filter((m: string) => !foundEmails.has(m));

               // 2. Fetch existing relations
               const existingRelations = await prisma.userGroup.findMany({
                    where: { groupId: id },
                    select: { userId: true }
               });
               const existingUserIds = new Set(existingRelations.map(r => r.userId));

               // 3. Calculate Diff
               const toAdd = [...foundUserIds].filter(uid => !existingUserIds.has(uid));
               const toRemove = [...existingUserIds].filter(uid => !foundUserIds.has(uid));

               // 4. Transactional update
               await prisma.$transaction(async (tx) => {
                    await tx.group.update({
                         where: { id },
                         data: { name, description, cohortId }
                    });

                    if (toRemove.length > 0) {
                         await tx.userGroup.deleteMany({
                              where: {
                                   groupId: id,
                                   userId: { in: toRemove }
                              }
                         });
                    }

                    if (toAdd.length > 0) {
                         await tx.userGroup.createMany({
                              data: toAdd.map(userId => ({
                                   userId,
                                   groupId: id
                              }))
                         });
                    }
               });
          } else {
               await prisma.group.update({
                    where: { id },
                    data: { name, description, cohortId }
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
