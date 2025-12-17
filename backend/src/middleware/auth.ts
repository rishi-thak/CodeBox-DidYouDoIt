import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
     user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
     const token = req.header('Authorization')?.replace('Bearer ', '');

     if (!token) {
          res.status(401).send({ error: 'Please authenticate.' });
          return;
     }

     try {
          const secret = process.env.JWT_SECRET || 'secret';
          // console.log('Verifying token with secret:', secret.substring(0, 5) + '...');

          const decoded = jwt.verify(token, secret) as { id: string };
          // console.log('Token decoded:', decoded);

          const user = await prisma.user.findUnique({ where: { id: decoded.id } });

          if (!user) {
               console.error('User not found for token ID:', decoded.id);
               throw new Error('User not found');
          }

          req.user = user;
          next();
     } catch (error: any) {
          console.error('Authentication Error:', error.message);
          res.status(401).send({ error: 'Please authenticate.', details: error.message });
     }
};

export const authorize = (allowedRoles: string[]) => {
     return (req: AuthRequest, res: Response, next: NextFunction) => {
          if (!req.user || !allowedRoles.includes(req.user.role)) {
               res.status(403).send({ error: 'Access denied.' });
               return;
          }
          next();
     };
};
