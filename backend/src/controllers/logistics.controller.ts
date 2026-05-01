import { Response } from 'express';
import prisma from '../config/prisma';
import { routeSchema } from '../validations/schemas';
import { AuthRequest } from '../middlewares/auth.middleware';
import { haversineKm, nearestNeighborRoute, generateRouteCode } from '../utils/helpers';

const DEPOT = { lat: 4.711, lon: -74.072, name: 'Centro de Acopio Bogotá' };

export const getPendingOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['PENDIENTE', 'CONFIRMADO'] } },
      include: {
        buyer: { select: { name: true, email: true } },
        items: {
          include: {
            product: {
              include: { producer: { include: { user: { select: { name: true } } } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const generateRoute = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderIds } = routeSchema.parse(req.body);

    // gather producer locations per order
    const points: {
      orderId: string;
      producerId: string;
      lat: number;
      lon: number;
      address: string;
      municipality: string;
    }[] = [];

    for (const orderId of orderIds) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: { include: { producer: true } } } },
        },
      });
      if (!order) continue;

      const producers = new Map<string, typeof order.items[0]['product']['producer']>();
      for (const item of order.items) {
        const prod = item.product.producer;
        if (!producers.has(prod.id)) producers.set(prod.id, prod);
      }

      for (const [, prod] of producers) {
        if (prod.latitude && prod.longitude) {
          points.push({
            orderId,
            producerId: prod.id,
            lat: prod.latitude,
            lon: prod.longitude,
            address: prod.address || prod.municipality,
            municipality: prod.municipality,
          });
        }
      }
    }

    if (points.length === 0) {
      res.status(400).json({ message: 'Los pedidos seleccionados no tienen coordenadas de productores' });
      return;
    }

    const sorted = nearestNeighborRoute(DEPOT, points);

    // total distance
    let totalKm = haversineKm(DEPOT.lat, DEPOT.lon, sorted[0].lat, sorted[0].lon);
    for (let i = 1; i < sorted.length; i++) {
      totalKm += haversineKm(sorted[i - 1].lat, sorted[i - 1].lon, sorted[i].lat, sorted[i].lon);
    }

    const routeCode = generateRouteCode();

    const routePlan = await prisma.routePlan.create({
      data: {
        code: routeCode,
        totalDistanceKm: parseFloat(totalKm.toFixed(2)),
        createdById: req.user!.id,
        stops: {
          create: sorted.map((p, idx) => ({
            orderId: p.orderId,
            producerId: p.producerId,
            stopOrder: idx + 1,
            latitude: p.lat,
            longitude: p.lon,
            address: p.address,
            municipality: p.municipality,
          })),
        },
      },
      include: {
        stops: { include: { order: true, producer: { include: { user: { select: { name: true } } } } } },
      },
    });

    // update order statuses and add traceability events
    for (const orderId of orderIds) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'EN_RECOLECCION',
          traceabilityEvents: {
            create: {
              title: 'Producto asignado a ruta logística',
              description: `El pedido fue asignado a la ruta ${routeCode}. Distancia total estimada: ${totalKm.toFixed(1)} km.`,
              location: 'Centro de Acopio Bogotá',
            },
          },
        },
      });
    }

    res.status(201).json({
      routePlan,
      depot: DEPOT,
      totalDistanceKm: totalKm.toFixed(2),
    });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ message: 'Datos inválidos', errors: err.errors }); return; }
    res.status(500).json({ message: err.message });
  }
};

export const getRoutes = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const routes = await prisma.routePlan.findMany({
      include: { stops: { include: { producer: true, order: true }, orderBy: { stopOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(routes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getRouteById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const route = await prisma.routePlan.findUnique({
      where: { id: req.params.id },
      include: {
        stops: {
          include: {
            producer: { include: { user: { select: { name: true } } } },
            order: { include: { buyer: { select: { name: true } } } },
          },
          orderBy: { stopOrder: 'asc' },
        },
      },
    });
    if (!route) { res.status(404).json({ message: 'Ruta no encontrada' }); return; }
    res.json({ route, depot: DEPOT });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
