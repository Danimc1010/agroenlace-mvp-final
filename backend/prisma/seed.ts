import { PrismaClient, Role, ProductStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de AgroEnlace...');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Productor principal ──
  const prodUser = await prisma.user.upsert({
    where: { email: 'productor@agroenlace.com' },
    update: {},
    create: {
      name: 'Productor Viotá',
      email: 'productor@agroenlace.com',
      passwordHash: await hash('Agro12345'),
      role: Role.PRODUCTOR,
      phone: '3101234567',
      producerProfile: {
        create: {
          farmName: 'Finca El Mango',
          municipality: 'Viotá',
          village: 'San Gabriel',
          address: 'Vereda San Gabriel, Viotá, Cundinamarca',
          latitude: 4.437,
          longitude: -74.522,
          description: 'Productor de frutas tropicales y café en Viotá, Cundinamarca.',
        },
      },
    },
    include: { producerProfile: true },
  });

  // ── Productor La Mesa ──
  const prodMesa = await prisma.user.upsert({
    where: { email: 'productor.lamesa@agroenlace.com' },
    update: {},
    create: {
      name: 'Productor La Mesa',
      email: 'productor.lamesa@agroenlace.com',
      passwordHash: await hash('Agro12345'),
      role: Role.PRODUCTOR,
      phone: '3109876543',
      producerProfile: {
        create: {
          farmName: 'Finca La Esperanza',
          municipality: 'La Mesa',
          village: 'Vereda Central',
          address: 'Vereda Central, La Mesa, Cundinamarca',
          latitude: 4.635,
          longitude: -74.463,
          description: 'Productor de hortalizas y frutas en La Mesa.',
        },
      },
    },
    include: { producerProfile: true },
  });

  // ── Productor Fusagasugá ──
  const prodFusa = await prisma.user.upsert({
    where: { email: 'productor.fusa@agroenlace.com' },
    update: {},
    create: {
      name: 'Productor Fusagasugá',
      email: 'productor.fusa@agroenlace.com',
      passwordHash: await hash('Agro12345'),
      role: Role.PRODUCTOR,
      phone: '3115551234',
      producerProfile: {
        create: {
          farmName: 'Finca Los Alpes',
          municipality: 'Fusagasugá',
          village: 'Vereda Bochica',
          address: 'Vereda Bochica, Fusagasugá, Cundinamarca',
          latitude: 4.337,
          longitude: -74.363,
          description: 'Productor de tubérculos y verduras en Fusagasugá.',
        },
      },
    },
    include: { producerProfile: true },
  });

  // ── Comprador ──
  await prisma.user.upsert({
    where: { email: 'comprador@agroenlace.com' },
    update: {},
    create: {
      name: 'Comprador Bogotá',
      email: 'comprador@agroenlace.com',
      passwordHash: await hash('Agro12345'),
      role: Role.COMPRADOR,
      phone: '3001234567',
      buyerProfile: {
        create: {
          buyerType: 'Restaurante',
          city: 'Bogotá',
          address: 'Calle 80 # 15-20, Bogotá',
        },
      },
    },
  });

  // ── Administrador ──
  await prisma.user.upsert({
    where: { email: 'admin@agroenlace.com' },
    update: {},
    create: {
      name: 'Admin Logístico',
      email: 'admin@agroenlace.com',
      passwordHash: await hash('Agro12345'),
      role: Role.ADMIN_LOGISTICO,
      phone: '3201234567',
    },
  });

  const prodProfile = prodUser.producerProfile!;
  const mesaProfile = prodMesa.producerProfile!;
  const fusaProfile = prodFusa.producerProfile!;

  // ── Productos ──
  const productsData = [
    {
      producerId: prodProfile.id,
      name: 'Mango Tommy',
      category: 'Fruta',
      description: 'Mango Tommy Atkins de primera calidad, cosecha reciente.',
      quantity: 120,
      unit: 'kg',
      price: 3200,
      municipality: 'Viotá',
      harvestDate: new Date('2026-04-15'),
      status: ProductStatus.DISPONIBLE,
    },
    {
      producerId: prodProfile.id,
      name: 'Café pergamino',
      category: 'Café',
      description: 'Café pergamino especial, variedad Castillo, proceso húmedo.',
      quantity: 80,
      unit: 'kg',
      price: 9500,
      municipality: 'Viotá',
      harvestDate: new Date('2026-03-20'),
      status: ProductStatus.DISPONIBLE,
    },
    {
      producerId: mesaProfile.id,
      name: 'Tomate chonto',
      category: 'Hortaliza',
      description: 'Tomate chonto fresco, ideal para salsas y ensaladas.',
      quantity: 150,
      unit: 'kg',
      price: 2800,
      municipality: 'La Mesa',
      harvestDate: new Date('2026-04-20'),
      status: ProductStatus.DISPONIBLE,
    },
    {
      producerId: fusaProfile.id,
      name: 'Papa criolla',
      category: 'Tubérculo',
      description: 'Papa criolla seleccionada, perfecta para sopas y frituras.',
      quantity: 200,
      unit: 'kg',
      price: 2500,
      municipality: 'Fusagasugá',
      harvestDate: new Date('2026-04-10'),
      status: ProductStatus.DISPONIBLE,
    },
    {
      producerId: mesaProfile.id,
      name: 'Mora de Castilla',
      category: 'Fruta',
      description: 'Mora de Castilla fresca, ideal para jugos y mermeladas.',
      quantity: 90,
      unit: 'kg',
      price: 4200,
      municipality: 'La Mesa',
      harvestDate: new Date('2026-04-18'),
      status: ProductStatus.DISPONIBLE,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: `seed-${p.name.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: { id: `seed-${p.name.replace(/\s/g, '-').toLowerCase()}`, ...p },
    });
  }

  console.log('✅ Seed completado exitosamente.');
  console.log('👤 Usuarios creados:');
  console.log('   productor@agroenlace.com  / Agro12345');
  console.log('   comprador@agroenlace.com  / Agro12345');
  console.log('   admin@agroenlace.com      / Agro12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
