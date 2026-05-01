import { Response } from 'express';
import prisma from '../config/prisma';
import { paymentSchema } from '../validations/schemas';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generatePaymentReference } from '../utils/helpers';

export const simulatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId, method } = paymentSchema.parse(req.body);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) { res.status(404).json({ message: 'Pedido no encontrado' }); return; }
    if (order.paymentStatus === 'SIMULADO' || order.paymentStatus === 'PAGADO') {
      res.status(400).json({ message: 'Este pedido ya tiene pago registrado' });
      return;
    }

    const transactionReference = generatePaymentReference();

    const payment = await prisma.payment.create({
      data: {
        orderId,
        method: method as any,
        status: 'SIMULADO',
        amount: order.total,
        transactionReference,
        paidAt: new Date(),
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'SIMULADO',
        status: 'CONFIRMADO',
        traceabilityEvents: {
          create: {
            title: 'Pago simulado registrado',
            description: `Pago simulado mediante ${method}. Referencia: ${transactionReference}`,
            location: 'Plataforma AgroEnlace',
          },
        },
      },
    });

    res.status(201).json({
      payment,
      transactionReference,
      traceabilityCode: order.traceabilityCode,
      orderId: order.id,
      message: 'Pago simulado exitosamente',
    });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ message: 'Datos inválidos', errors: err.errors }); return; }
    res.status(500).json({ message: err.message });
  }
};

export const getPaymentByOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payment = await prisma.payment.findUnique({ where: { orderId: req.params.orderId } });
    if (!payment) { res.status(404).json({ message: 'Pago no encontrado' }); return; }
    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
