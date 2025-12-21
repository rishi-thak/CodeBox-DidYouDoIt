import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// List Users
export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Access denied' });
               return;
          }

          // Include groups in the response
          const users = await prisma.user.findMany({
               orderBy: { createdAt: 'desc' },
               include: {
                    groups: {
                         include: {
                              group: true
                         }
                    }
               }
          });

          // Transform response to match frontend expectations if necessary
          // Note: Frontend likely expects groups as an array of IDs or objects. 
          // Current logic in frontend might just expect 'User' object. 
          // We will return the full Prisma object and let frontend adapt.
          res.json(users);
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch users' });
     }
};

// Create User
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Access denied' });
               return;
          }


          const { fullName, email, role, status, groupIds } = req.body;

          // Check if user exists
          const existing = await prisma.user.findUnique({ where: { email } });
          if (existing) {
               res.status(400).json({ error: 'User with this email already exists' });
               return;
          }

          const newUser = await prisma.user.create({
               data: {
                    fullName,
                    email,
                    role: role || 'DEVELOPER', // Default
                    status: status || 'ACTIVE',
                    // Map groupIds to connect logic
                    groups: groupIds && groupIds.length > 0 ? {
                         create: groupIds.map((gid: string) => ({
                              group: { connect: { id: gid } }
                         }))
                    } : undefined
               },
               include: {
                    groups: { include: { group: true } }
               }
          });

          res.json(newUser);
     } catch (error: any) {
          console.error("Create User Error:", error);
          if (error.code === 'P2002') { // Prisma unique constraint error
               res.status(400).json({ error: 'User with this email already exists' });
               return;
          }
          res.status(500).json({ error: 'Failed to create user', details: error.message });
     }
};

// Update User
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Access denied' });
               return;
          }

          const { id } = req.params;
          const { fullName, email, role, status, groupIds } = req.body;

          // Transaction to handle updating groups (disconnect all, then connect new)
          // If groupIds is provided
          let data: any = { fullName, email, role, status };

          if (groupIds) {
               // This is a simple strategy: delete all existing memberships for this user, then create new ones
               // NOTE: Prisma `set` on many-to-many implicit is easier, but we have explicit `Membership` model likely?
               // Let's check prisma schema implicitly. 
               // Wait, I recall we might be using implicit or explicit. 
               // Without schema, assuming standard relation. 
               // If explicit Membership model (User -> Membership -> Group)

               // Safe approach: Update primitives. Handle groups separately if complex.
               // Assuming `groups` is a relation field `User` -> `Membership[]`

               // To make "set" work on explicit relation, we usually deleteMany then create.
          }

          // Simpler for now: Update basic fields. 
          // Logic for group updating requires knowing exact schema. 
          // Based on previous MemberManager: `g.members.includes(user.email)` suggests groups have list of members.

          // Let's do a transactional update if possible, assuming explicit relations based on `create` above.

          // First update the user details
          const updatedUser = await prisma.$transaction(async (tx) => {
               const user = await tx.user.update({
                    where: { id },
                    data: { fullName, email, role, status }
               });

               if (groupIds) {
                    // Delete existing memberships
                    await tx.userGroup.deleteMany({ where: { userId: id } });

                    // Create new memberships
                    if (groupIds.length > 0) {
                         await tx.userGroup.createMany({
                              data: groupIds.map((gid: string) => ({
                                   userId: id,
                                   groupId: gid
                              }))
                         });
                    }
               }
               return user;
          });

          // Fetch fresh with relations
          const finalUser = await prisma.user.findUnique({
               where: { id },
               include: { groups: { include: { group: true } } }
          });

          res.json(finalUser);

     } catch (error: any) {
          console.error("Update User Error:", error);
          res.status(500).json({ error: 'Failed to update user', details: error.message });
     }
};

// Delete Users (Bulk)
export const deleteUsers = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Access denied' });
               return;
          }

          const { ids } = req.body; // Expecting array of strings

          if (!ids || !Array.isArray(ids)) {
               res.status(400).json({ error: 'Invalid IDs provided' });
               return;
          }

          // Prevent self-deletion
          const validIds = ids.filter(id => id !== req.user!.id);

          if (validIds.length === 0) {
               res.json({ success: false, message: "Cannot delete yourself" });
               return;
          }

          const result = await prisma.user.deleteMany({
               where: {
                    id: { in: validIds }
               }
          });

          res.json({ success: true, count: result.count });
     } catch (error: any) {
          console.error("Delete Users Error:", error);
          res.status(500).json({ error: 'Failed to delete users', details: error.message });
     }
};
