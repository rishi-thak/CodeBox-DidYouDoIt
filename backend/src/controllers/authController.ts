import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response): Promise<void> => {
     const { email, role } = req.body;

     if (!email || !email.endsWith('.edu')) {
          res.status(400).json({ error: 'Valid .edu email is required' });
          return;
     }

     try {
          // Check if user exists
          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
               // Create new user - Default to DEVELOPER if no role specified
               user = await prisma.user.create({
                    data: {
                         email,
                         role: (role as Role) || Role.DEVELOPER,
                         fullName: email.split('@')[0]
                    }
               });
          }
          // If user exists, we just log them in with their EXISTING role.
          // We do NOT update their role based on the request body anymore.

          const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

          res.json({ user, token });
     } catch (error: any) {
          console.error("Login Error Details:", error);
          res.status(500).json({
               error: 'Login failed',
               details: error.message,
               stack: error.stack
          });
     }
};

export const getMe = async (req: any, res: Response) => {
     res.json(req.user);
};
