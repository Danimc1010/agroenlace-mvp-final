import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['PRODUCTOR', 'COMPRADOR', 'ADMIN_LOGISTICO']),
  phone: z.string().optional(),
  // productor
  farmName: z.string().optional(),
  municipality: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  // comprador
  buyerType: z.string().optional(),
  city: z.string().optional(),
  buyerAddress: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  price: z.number().positive(),
  municipality: z.string().min(1),
  harvestDate: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
    })
  ).min(1, 'El pedido debe tener al menos un producto'),
  deliveryAddress: z.string().optional(),
});

export const paymentSchema = z.object({
  orderId: z.string(),
  method: z.enum(['NEQUI', 'DAVIPLATA', 'PSE', 'CONTRAENTREGA']),
});

export const orderStatusSchema = z.object({
  status: z.enum(['PENDIENTE', 'CONFIRMADO', 'EN_RECOLECCION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']),
});

export const routeSchema = z.object({
  orderIds: z.array(z.string()).min(1, 'Selecciona al menos un pedido'),
});

export const traceabilityEventSchema = z.object({
  orderId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
});
