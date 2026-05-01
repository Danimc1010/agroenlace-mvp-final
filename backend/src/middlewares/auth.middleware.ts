import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import prisma from '../config/prisma';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token de autenticación requerido' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      email: string;
      role: Role;
    };

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      res.status(401).json({ message: 'Usuario no encontrado' });
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const authorize = (...roles: Role[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'No tienes permisos para esta acción' });
      return;
    }
    next();
  };
