import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const listCohorts = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          // Return all cohorts, let frontend filter active/archived
          const cohorts = await prisma.cohort.findMany({
               orderBy: { name: 'desc' }
          });
          res.json(cohorts);
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch cohorts' });
     }
};

export const createCohort = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Only admins can create cohorts' });
               return;
          }

          const { name, startDate, endDate, isActive } = req.body;

          const existing = await prisma.cohort.findUnique({
               where: { name }
          });

          if (existing) {
               res.status(400).json({ error: 'Cohort with this name already exists' });
               return;
          }

          const cohort = await prisma.cohort.create({
               data: {
                    name,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    isActive: isActive ?? true
               }
          });

          res.json(cohort);
     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to create cohort' });
     }
};

export const updateCohort = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Only admins can update cohorts' });
               return;
          }

          const { id } = req.params;
          const { name, isActive, startDate, endDate } = req.body;

          // Perform update
          const cohort = await prisma.cohort.update({
               where: { id },
               data: {
                    name,
                    isActive,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined
               }
          });

          // Cascade status to groups (Archive or Unarchive/Restore)
          if (isActive !== undefined) {
               await prisma.group.updateMany({
                    where: { cohortId: id },
                    data: { status: isActive ? 'ACTIVE' : 'ARCHIVED' }
               });
          }

          res.json(cohort);
     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to update cohort' });
     }
};

export const deleteCohort = async (req: AuthRequest, res: Response): Promise<void> => {
     try {
          if (req.user?.role !== 'BOARD_ADMIN') {
               res.status(403).json({ error: 'Only admins can delete cohorts' });
               return;
          }

          const { id } = req.params;

          // Check if cohort has groups
          const cohort = await prisma.cohort.findUnique({
               where: { id },
               include: { groups: true }
          });

          if (!cohort) {
               res.status(404).json({ error: 'Cohort not found' });
               return;
          }

          if (cohort.groups.length > 0) {
               res.status(400).json({ error: `Cannot delete cohort '${cohort.name}' because it has ${cohort.groups.length} groups assigned. Please reassign or delete these groups first.` });
               return;
          }

          await prisma.cohort.delete({
               where: { id }
          });

          res.json({ success: true });
     } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Failed to delete cohort' });
     }
};
