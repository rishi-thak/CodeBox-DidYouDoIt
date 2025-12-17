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
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
          const user = await prisma.user.findUnique({ where: { id: decoded.id } });

          if (!user) {
               throw new Error();
          }

          req.user = user;
          next();
     } catch (error) {
          res.status(401).send({ error: 'Please authenticate.' });
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
