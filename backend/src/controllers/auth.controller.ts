import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { config } from '../config/env';
import { registerSchema, loginSchema } from '../validations/schemas';
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(400).json({ message: 'El correo ya está registrado' });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role as any,
        phone: data.phone,
        ...(data.role === 'PRODUCTOR' && {
          producerProfile: {
            create: {
              farmName: data.farmName || data.name,
              municipality: data.municipality || '',
              village: data.village,
              address: data.address,
              latitude: data.latitude,
              longitude: data.longitude,
              description: data.description,
            },
          },
        }),
        ...(data.role === 'COMPRADOR' && {
          buyerProfile: {
            create: {
              buyerType: data.buyerType,
              city: data.city,
              address: data.buyerAddress,
            },
          },
        }),
      },
      include: { producerProfile: true, buyerProfile: true },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      res.status(400).json({ message: 'Datos inválidos', errors: err.errors });
      return;
    }
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { producerProfile: true, buyerProfile: true },
    });
    if (!user) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
