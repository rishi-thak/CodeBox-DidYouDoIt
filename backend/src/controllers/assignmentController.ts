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

          // Find assignments assigned to these groups OR assigned to everyone (no groups)
          const assignments = await prisma.assignment.findMany({
               where: {
                    OR: [
                         {
                              assignedTo: {
                                   some: {
                                        groupId: { in: groupIds }
                                   }
                              }
                         },
                         {
                              assignedTo: {
                                   none: {}
                              }
                         }
                    ]
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

export const updateAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          const user = req.user!;
          const { id } = req.params;
          const { title, description, type, contentUrl, groupIds, dueDate } = req.body;

          if (user.role === 'DEVELOPER') {
               res.status(403).json({ error: 'Developers cannot update assignments' });
               return;
          }

          // Fetch assignment to check ownership or existing groups if needed? 
          // For now, trust role check.

          // Validate Groups same as create
          if (user.role !== 'BOARD_ADMIN' && groupIds) {
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

          // Transaction to update
          await prisma.$transaction(async (tx) => {
               await tx.assignment.update({
                    where: { id },
                    data: {
                         title,
                         description,
                         type,
                         contentUrl,
                         dueDate: dueDate ? new Date(dueDate) : undefined
                    }
               });

               if (groupIds) {
                    // 1. Get current assignments
                    const currentAssignments = await prisma.assignmentGroup.findMany({
                         where: { assignmentId: id },
                         select: { groupId: true }
                    });
                    const currentGroupIds = new Set(currentAssignments.map(a => a.groupId));
                    const newGroupIds = new Set(groupIds as string[]);

                    // 2. Diff
                    const toAdd = [...newGroupIds].filter(gid => !currentGroupIds.has(gid));
                    const toRemove = [...currentGroupIds].filter(gid => !newGroupIds.has(gid));

                    // 3. Apply changes
                    if (toRemove.length > 0) {
                         await tx.assignmentGroup.deleteMany({
                              where: {
                                   assignmentId: id,
                                   groupId: { in: toRemove }
                              }
                         });
                    }

                    if (toAdd.length > 0) {
                         await tx.assignmentGroup.createMany({
                              data: toAdd.map(gid => ({
                                   assignmentId: id,
                                   groupId: gid
                              }))
                         });
                    }
               }
          });

          res.json({ success: true });
     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update assignment' });
     }
};

export const deleteAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          const user = req.user!;
          const { id } = req.params;

          if (user.role === 'DEVELOPER') {
               res.status(403).json({ error: 'No permission' });
               return;
          }

          // If not Board Admin, ensure they "own" it? 
          // Or we lock delete to Board Admin for now for safety?
          // User asked for "Tech Leads... just manage assignments tab". 
          // Assuming Tech Leads can delete too within their scope? 
          // Complex logic to check if assignment belongs ONLY to their groups.
          // For MVP, lets allow Board Admin and Tech Lead/PM to delete any assignment they can see?
          // Simplest: Board Admin only for delete? No, User said "make deleting... work" in context of flushing out tabs.

          if (user.role !== 'BOARD_ADMIN') {
               // Security Check: Can this user delete this assignment?
               // Rule: Users can only delete assignments that are EXCLUSIVELY assigned to groups they manage.
               // If an assignment is assigned to "Everyone" (global) or a group they don't manage, they cannot delete it.

               const userGroups = await prisma.userGroup.findMany({
                    where: { userId: user.id },
                    select: { groupId: true }
               });
               const myGroupIds = new Set(userGroups.map(ug => ug.groupId));

               // Fetch assignment's groups
               const assignmentGroups = await prisma.assignmentGroup.findMany({
                    where: { assignmentId: id },
                    select: { groupId: true }
               });

               if (assignmentGroups.length === 0) {
                    // Assigned to everyone -> Only Board Admin can delete
                    res.status(403).json({ error: 'Only admins can delete global assignments' });
                    return;
               }

               const isAssignedOnlyToMyGroups = assignmentGroups.every(ag => myGroupIds.has(ag.groupId));

               if (!isAssignedOnlyToMyGroups) {
                    res.status(403).json({ error: 'You cannot delete this assignment as it is assigned to groups you do not manage' });
                    return;
               }
          }

          await prisma.assignment.delete({ where: { id } });
          res.json({ success: true });
     } catch (error) {
          res.status(500).json({ error: 'Failed to delete assignment' });
     }
};

export const getAssignmentStats = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          const { id } = req.params;
          const user = req.user!;

          // 1. Get Assignment and its Groups
          const assignment = await prisma.assignment.findUnique({
               where: { id },
               include: { assignedTo: { include: { group: { include: { members: { include: { user: true } } } } } } }
          });

          if (!assignment) {
               res.status(404).json({ error: 'Assignment not found' });
               return;
          }

          // 2. Determine Scope of Users
          let targetUsers: { id: string, email: string, fullName: string | null }[] = [];

          if (assignment.assignedTo.length === 0) {
               // Global assignment - All users
               const allUsers = await prisma.user.findMany();
               targetUsers = allUsers.map(u => ({ id: u.id, email: u.email, fullName: u.fullName }));
          } else {
               // Specific Groups - Collect unique users
               const uniqueUsers = new Map<string, { id: string, email: string, fullName: string | null }>();
               assignment.assignedTo.forEach(ag => {
                    ag.group.members.forEach(m => {
                         uniqueUsers.set(m.user.id, { id: m.user.id, email: m.user.email, fullName: m.user.fullName });
                    });
               });
               targetUsers = Array.from(uniqueUsers.values());
          }

          // 3. Get Completions
          const completions = await prisma.completion.findMany({
               where: { assignmentId: id }
          });
          const completionMap = new Map(completions.map(c => [c.userId, c]));

          // 4. Combine Data
          const stats = targetUsers.map(u => {
               const completion = completionMap.get(u.id);
               return {
                    userId: u.id,
                    email: u.email,
                    fullName: u.fullName || u.email.split('@')[0],
                    status: completion ? 'COMPLETED' : 'PENDING',
                    completedAt: completion?.completedAt || null
               };
          });

          res.json({
               assignmentTitle: assignment.title,
               totalAssigned: targetUsers.length,
               totalCompleted: completions.length,
               completionRate: targetUsers.length > 0 ? (completions.length / targetUsers.length) * 100 : 0,
               details: stats
          });

     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to fetch assignment stats' });
     }
};
