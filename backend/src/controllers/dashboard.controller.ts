import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user!.role;

    if (role === 'PRODUCTOR') {
      const profile = await prisma.producerProfile.findUnique({ where: { userId: req.user!.id } });
      if (!profile) { res.status(404).json({ message: 'Perfil no encontrado' }); return; }

      const [total, available, orders] = await Promise.all([
        prisma.product.count({ where: { producerId: profile.id } }),
        prisma.product.count({ where: { producerId: profile.id, status: 'DISPONIBLE' } }),
        prisma.orderItem.count({ where: { product: { producerId: profile.id } } }),
      ]);
      res.json({ role: 'PRODUCTOR', total, available, orders });
      return;
    }

    if (role === 'COMPRADOR') {
      const [totalOrders, lastOrder, totalSpent] = await Promise.all([
        prisma.order.count({ where: { buyerId: req.user!.id } }),
        prisma.order.findFirst({ where: { buyerId: req.user!.id }, orderBy: { createdAt: 'desc' } }),
        prisma.order.aggregate({ where: { buyerId: req.user!.id }, _sum: { total: true } }),
      ]);
      res.json({ role: 'COMPRADOR', totalOrders, lastOrder, totalSpent: totalSpent._sum.total || 0 });
      return;
    }

    // ADMIN_LOGISTICO
    const [totalProducts, totalOrders, pendingOrders, deliveredOrders, totalRoutes, totalSales, byStatus, byMunicipality] =
      await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDIENTE' } }),
        prisma.order.count({ where: { status: 'ENTREGADO' } }),
        prisma.routePlan.count(),
        prisma.order.aggregate({ _sum: { total: true } }),
        prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
        prisma.product.groupBy({ by: ['municipality'], _count: { id: true } }),
      ]);

    res.json({
      role: 'ADMIN_LOGISTICO',
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRoutes,
      totalSales: totalSales._sum.total || 0,
      byStatus,
      byMunicipality,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
