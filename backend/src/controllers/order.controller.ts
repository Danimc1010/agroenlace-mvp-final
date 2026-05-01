import { Response } from 'express';
import prisma from '../config/prisma';
import { orderSchema, orderStatusSchema } from '../validations/schemas';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generateTraceabilityCode } from '../utils/helpers';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = orderSchema.parse(req.body);

    // Pre-validate stock before opening transaction
    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.status !== 'DISPONIBLE') {
        res.status(400).json({ message: `Producto ${item.productId} no disponible` });
        return;
      }
      if (product.quantity < item.quantity) {
        res.status(400).json({ message: `Stock insuficiente para "${product.name}". Disponible: ${product.quantity}` });
        return;
      }
    }

    const orderCount = await prisma.order.count();
    const traceabilityCode = generateTraceabilityCode(orderCount + 1);

    // Compute totals
    let total = 0;
    const itemsData: { productId: string; quantity: number; unitPrice: number; subtotal: number }[] = [];
    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      const unitPrice = product!.price;
      const subtotal = unitPrice * item.quantity;
      total += subtotal;
      itemsData.push({ productId: item.productId, quantity: item.quantity, unitPrice, subtotal });
    }

    // Use a Prisma transaction to create order + discount stock atomically
    const order = await prisma.$transaction(async (tx) => {
      // Create order with items and traceability event
      const created = await tx.order.create({
        data: {
          buyerId: req.user!.id,
          total,
          deliveryAddress: data.deliveryAddress,
          traceabilityCode,
          items: { create: itemsData },
          traceabilityEvents: {
            create: {
              title: 'Pedido creado',
              description: 'El pedido fue registrado exitosamente en el sistema AgroEnlace.',
              location: 'Sistema AgroEnlace',
            },
          },
        },
        include: { items: { include: { product: true } }, traceabilityEvents: true },
      });

      // Discount stock for each item
      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;
        const newQty = product.quantity - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: newQty,
            status: newQty <= 0 ? 'VENDIDO' : 'DISPONIBLE',
          },
        });
      }

      return created;
    });

    res.status(201).json(order);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ message: 'Datos inválidos', errors: err.errors }); return; }
    res.status(500).json({ message: err.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: { buyer: { select: { name: true, email: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user!.id },
      include: { items: { include: { product: { include: { producer: true } } } }, traceabilityEvents: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        buyer: { select: { name: true, email: true } },
        items: { include: { product: { include: { producer: { include: { user: { select: { name: true } } } } } } } },
        traceabilityEvents: { orderBy: { createdAt: 'asc' } },
        payment: true,
      },
    });
    if (!order) { res.status(404).json({ message: 'Pedido no encontrado' }); return; }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = orderStatusSchema.parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) { res.status(404).json({ message: 'Pedido no encontrado' }); return; }

    const statusLabels: Record<string, string> = {
      CONFIRMADO: 'Pedido confirmado por el equipo logístico.',
      EN_RECOLECCION: 'El producto está siendo recolectado en finca.',
      EN_CAMINO: 'El pedido está en camino hacia el destino.',
      ENTREGADO: 'El pedido fue entregado exitosamente.',
      CANCELADO: 'El pedido fue cancelado.',
    };

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: status as any,
        traceabilityEvents: {
          create: {
            title: `Estado actualizado: ${status.replace(/_/g, ' ')}`,
            description: statusLabels[status] || `Estado cambiado a ${status}`,
            location: 'Sistema logístico AgroEnlace',
          },
        },
      },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/producer-orders — only for PRODUCTOR
export const getProducerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find the producer profile linked to this user
    const producerProfile = await prisma.producerProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!producerProfile) {
      res.status(404).json({ message: 'Perfil de productor no encontrado' });
      return;
    }

    // Find orders that contain at least one product belonging to this producer
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { producerId: producerProfile.id },
          },
        },
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              include: { producer: true },
            },
          },
        },
        traceabilityEvents: { orderBy: { createdAt: 'asc' } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter items to only show products belonging to this producer
    const filtered = orders.map((order) => ({
      ...order,
      items: order.items.filter((item) => item.product.producerId === producerProfile.id),
    }));

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
