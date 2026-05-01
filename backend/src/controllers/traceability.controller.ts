import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { traceabilityEventSchema } from '../validations/schemas';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { traceabilityCode: req.params.traceabilityCode },
      include: {
        buyer: { select: { name: true, email: true } },
        items: {
          include: {
            product: {
              include: {
                producer: { include: { user: { select: { name: true } } } },
              },
            },
          },
        },
        traceabilityEvents: { orderBy: { createdAt: 'asc' } },
        payment: true,
      },
    });
    if (!order) { res.status(404).json({ message: 'Código de trazabilidad no encontrado' }); return; }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = traceabilityEventSchema.parse(req.body);
    const event = await prisma.traceabilityEvent.create({ data });
    res.status(201).json(event);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ message: 'Datos inválidos', errors: err.errors }); return; }
    res.status(500).json({ message: err.message });
  }
};
