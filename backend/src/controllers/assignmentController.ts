import { Response } from 'express';
import { PrismaClient, Role, AssignmentType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get Assignments
export const listAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          const user = req.user!;

          if (user.role === 'BOARD_ADMIN') {
               const assignments = await prisma.assignment.findMany({
                    include: { assignedTo: { include: { group: true } } }
               });
               res.json(assignments);
               return;
          }

          // For others, find their groups first
          const userGroups = await prisma.userGroup.findMany({
               where: { userId: user.id },
               select: { groupId: true }
          });
          const groupIds = userGroups.map(ug => ug.groupId);

          // Find assignments assigned to these groups
          // Also assuming "All Members" is a group the user is in better than "null".
          const assignments = await prisma.assignment.findMany({
               where: {
                    assignedTo: {
                         some: {
                              groupId: { in: groupIds }
                         }
                    }
               },
               include: { assignedTo: { include: { group: true } } }
          });

          res.json(assignments);
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch assignments' });
     }
};

// Create Assignment
export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          const user = req.user!;
          const { title, description, type, contentUrl, groupIds, dueDate } = req.body;

          if (user.role === 'DEVELOPER') {
               res.status(403).json({ error: 'Developers cannot create assignments' });
               return;
          }

          // Validate Groups
          if (user.role !== 'BOARD_ADMIN') {
               // Tech Lead / PM can only assign to their groups
               const userGroups = await prisma.userGroup.findMany({
                    where: { userId: user.id },
                    select: { groupId: true }
               });
               const myGroupIds = new Set(userGroups.map(ug => ug.groupId));

               const hasAccess = (groupIds as string[]).every(gid => myGroupIds.has(gid));
               if (!hasAccess) {
                    res.status(403).json({ error: 'You can only assign to groups you manage' });
                    return;
               }
          }

          const assignment = await prisma.assignment.create({
               data: {
                    title,
                    description,
                    type,
                    contentUrl,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    assignedTo: {
                         create: (groupIds as string[]).map(groupId => ({
                              group: { connect: { id: groupId } }
                         }))
                    }
               }
          });

          res.json(assignment);
     } catch (error) {
          res.status(500).json({ error: 'Failed to create assignment' });
     }
};
