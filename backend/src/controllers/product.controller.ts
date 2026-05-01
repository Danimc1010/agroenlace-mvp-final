import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { productSchema } from '../validations/schemas';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, municipality } = req.query as Record<string, string>;
    const products = await prisma.product.findMany({
      where: {
        status: 'DISPONIBLE',
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(category && { category: { contains: category, mode: 'insensitive' } }),
        ...(municipality && { municipality: { contains: municipality, mode: 'insensitive' } }),
      },
      include: { producer: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { producer: { include: { user: { select: { name: true, phone: true } } } } },
    });
    if (!product) { res.status(404).json({ message: 'Producto no encontrado' }); return; }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await prisma.producerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) { res.status(404).json({ message: 'Perfil de productor no encontrado' }); return; }
    const products = await prisma.product.findMany({
      where: { producerId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = productSchema.parse(req.body);
    const profile = await prisma.producerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) { res.status(404).json({ message: 'Perfil de productor no encontrado' }); return; }

    const product = await prisma.product.create({
      data: {
        producerId: profile.id,
        name: data.name,
        category: data.category,
        description: data.description,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        municipality: data.municipality,
        harvestDate: data.harvestDate ? new Date(data.harvestDate) : undefined,
        imageUrl: data.imageUrl,
      },
    });
    res.status(201).json(product);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ message: 'Datos inválidos', errors: err.errors }); return; }
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = productSchema.partial().parse(req.body);
    const profile = await prisma.producerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) { res.status(404).json({ message: 'Perfil no encontrado' }); return; }

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, producerId: profile.id },
    });
    if (!product) { res.status(404).json({ message: 'Producto no encontrado' }); return; }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...data,
        harvestDate: data.harvestDate ? new Date(data.harvestDate) : undefined,
      },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await prisma.producerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) { res.status(404).json({ message: 'Perfil no encontrado' }); return; }

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, producerId: profile.id },
    });
    if (!product) { res.status(404).json({ message: 'Producto no encontrado' }); return; }

    await prisma.product.update({
      where: { id: req.params.id },
      data: { status: 'INACTIVO' },
    });
    res.json({ message: 'Producto desactivado correctamente' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
