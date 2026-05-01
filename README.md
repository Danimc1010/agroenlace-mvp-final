# 🌿 AgroEnlace MVP TRL5

> Marketplace agrícola digital para pequeños productores de Cundinamarca.  
> Conecta productores rurales con compradores urbanos con logística inteligente y trazabilidad básica.

---

## Correcciones aplicadas (v1.1)

Las siguientes correcciones fueron aplicadas sobre el prototipo original para dejarlo listo para GitHub y demostración académica TRL5:

| # | Archivo(s) modificado(s) | Corrección |
|---|--------------------------|-----------|
| 1 | Estructura del repo | Eliminadas carpetas basura `{backend/`, `{backend/{prisma,src/` y derivadas (artefactos de expansión de llaves de shell) |
| 2 | `frontend/src/context/AuthContext.tsx` · `AuthPages.tsx` | `RegisterPage` ahora llama a `AuthContext.register()` en lugar de escribir directamente en `localStorage`. La sesión queda consistente al registrar. |
| 3 | `frontend/src/context/CartContext.tsx` | `addItem` y `updateQty` validan que la cantidad acumulada no supere `product.quantity`. Devuelven `{ ok, message }` para que la UI muestre feedback al usuario. |
| 4 | `backend/src/controllers/order.controller.ts` | `createOrder` usa `prisma.$transaction()` para crear el pedido y descontar stock de forma atómica. Si `quantity` llega a 0, el producto pasa a estado `VENDIDO`. |
| 5 | `backend/src/controllers/order.controller.ts` · `routes/index.ts` | Nuevo endpoint `GET /api/orders/producer-orders` (solo `PRODUCTOR`). Devuelve los pedidos que contienen productos del productor autenticado, filtrando items. |
| 6 | `frontend/src/pages/ProducerOrdersPage.tsx` · `App.tsx` · `DashboardPage.tsx` | Nueva página `/producer/orders` con vista de pedidos recibidos por productor. Enlace añadido en el dashboard del productor. |
| 7 | `backend/src/routes/users.routes.ts` · `app.ts` | Nuevo endpoint `GET /api/users/me` registrado en `/api/users`. Reutiliza el handler `me` de `auth.controller.ts`. |
| 8 | `backend/package.json` | Script `start` corregido a `node dist/src/server.js` para coincidir con `outDir: ./dist` + `rootDir: ./` del `tsconfig.json`. |
| 9 | `frontend/src/pages/TraceabilityPage.tsx` | Auto-búsqueda al cargar si la URL contiene `?code=AGRO-XXXX-XXXXXX`. Simula lectura de QR o enlace directo de trazabilidad. |

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 · Vite · TypeScript · Tailwind CSS · React Router |
| Mapas | Leaflet + React Leaflet + OpenStreetMap (sin API key) |
| Backend | Node.js · Express · TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL 15 |
| Auth | JWT + bcrypt |
| Validaciones | Zod |
| Contenedor | Docker + Docker Compose |

---

## Estructura del proyecto

```
agroenlace-mvp/
├── frontend/          # React + Vite
│   └── src/
│       ├── pages/     # LandingPage, CatalogPages, CartPages, ProducerPages,
│       │              # ProducerOrdersPage, AdminPages, TraceabilityPage...
│       ├── components/ # Navbar, MapView, TraceabilityTimeline, ProductForm...
│       ├── context/   # AuthContext (con register()), CartContext (con validación stock)
│       ├── hooks/     # useOffline
│       └── api/       # axios instance
├── backend/           # Express API
│   ├── prisma/        # schema.prisma + seed.ts
│   └── src/
│       ├── controllers/  # auth, order (con transacción + producer-orders), product...
│       ├── routes/       # index, auth, product, users
│       ├── middlewares/
│       ├── validations/
│       └── utils/
├── docker-compose.yml
└── README.md
```

---

## Requisitos previos

- **Node.js** 18 o superior
- **npm** 9 o superior
- **Docker** + **Docker Compose**
- Git

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/agroenlace-mvp.git
cd agroenlace-mvp
```

### 2. Instalar dependencias

```bash
npm run install:all
```

O manualmente:

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Configuración de variables de entorno

### Backend

```bash
cd backend
cp .env.example .env
```

El archivo `.env` debe contener:

```env
DATABASE_URL="postgresql://agroenlace:agroenlace123@localhost:5432/agroenlace_db?schema=public"
JWT_SECRET="agroenlace_super_secret_key"
JWT_EXPIRES_IN="7d"
PORT=4000
FRONTEND_URL="http://localhost:5173"
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

El archivo `.env` debe contener:

```env
VITE_API_URL="http://localhost:4000/api"
```

---

## Ejecución de PostgreSQL con Docker

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Verificar que el contenedor esté activo:

```bash
docker ps
# Debe aparecer: agroenlace_db (postgres:15-alpine)
```

---

## Migraciones Prisma

```bash
cd backend
npm run prisma:migrate
```

Cuando pregunte por el nombre de la migración: `init`

---

## Seed de base de datos

```bash
cd backend
npm run prisma:seed
```

Esto crea:
- 5 usuarios (3 productores, 1 comprador, 1 admin)
- 5 productos iniciales en Viotá, La Mesa y Fusagasugá

---

## Ejecutar el backend

```bash
cd backend
npm run dev
# API disponible en http://localhost:4000
# Health check: http://localhost:4000/health
```

---

## Ejecutar el frontend

```bash
cd frontend
npm run dev
# App disponible en http://localhost:5173
```

---

## Ejecutar ambos simultáneamente (desde raíz)

```bash
npm install   # instala concurrently
npm run dev
```

---

## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| 👨‍🌾 Productor | `productor@agroenlace.com` | `Agro12345` |
| 🛒 Comprador | `comprador@agroenlace.com` | `Agro12345` |
| 🚚 Admin Logístico | `admin@agroenlace.com` | `Agro12345` |

---

## Flujo de demostración completo

### Flujo del comprador

1. Ir a `http://localhost:5173`
2. Iniciar sesión como comprador (`comprador@agroenlace.com`)
3. Ir al **Catálogo** → filtrar por municipio "Viotá"
4. Hacer clic en **"Agregar al carrito"**
5. Ir al **Carrito** → **"Confirmar pedido"**
6. En la página de pago → seleccionar **"Nequi"** → **"Confirmar pago"**
7. Ver la referencia de pago simulado
8. Ir a **"Mis pedidos"** → anotar el **código AGRO-XXXX-XXXXXX**
9. Ir a **Trazabilidad** → ingresar el código → ver la línea de tiempo
10. También puedes acceder directo: `/traceability?code=AGRO-XXXX-XXXXXX`

### Flujo del productor — pedidos recibidos (nuevo)

1. Iniciar sesión como productor (`productor@agroenlace.com`)
2. En el dashboard, hacer clic en **"Pedidos recibidos"**
3. Ver todos los pedidos que contienen productos del productor
4. Cada pedido muestra: código de trazabilidad, comprador, estado, pago, productos y total

### Flujo del admin logístico

1. Iniciar sesión como admin (`admin@agroenlace.com`)
2. Ir a **"Pedidos pendientes"** → seleccionar pedidos
3. Ir a **"Generar ruta"** → seleccionar pedidos → **"Generar ruta"**
4. Ver el mapa con los puntos y la ruta
5. Cambiar estado de pedido → la trazabilidad se actualiza automáticamente

### Modo offline (productor)

1. Iniciar sesión como productor
2. Desactivar la red (DevTools → Network → Offline)
3. Ir a **"Crear producto"** → completar formulario → **"Guardar offline"**
4. Ir a **"Productos pendientes de sincronización"**
5. Restaurar conexión → hacer clic en **"Sincronizar"**

---

## Endpoints API REST

| Método | Ruta | Rol requerido | Descripción |
|--------|------|---------------|-------------|
| POST | `/api/auth/register` | Público | Registrar usuario |
| POST | `/api/auth/login` | Público | Iniciar sesión |
| GET | `/api/auth/me` | Autenticado | Perfil actual |
| GET | `/api/users/me` | Autenticado | Alias de `/api/auth/me` |
| GET | `/api/products` | Público | Catálogo con filtros |
| GET | `/api/products/:id` | Público | Detalle producto |
| POST | `/api/products` | PRODUCTOR | Crear producto |
| PUT | `/api/products/:id` | PRODUCTOR | Editar producto |
| DELETE | `/api/products/:id` | PRODUCTOR | Desactivar producto |
| GET | `/api/products/my-products` | PRODUCTOR | Mis productos |
| POST | `/api/orders` | COMPRADOR | Crear pedido (valida y descuenta stock) |
| GET | `/api/orders/my-orders` | COMPRADOR | Mis pedidos |
| GET | `/api/orders/producer-orders` | PRODUCTOR | Pedidos recibidos por el productor |
| GET | `/api/orders/:id` | Autenticado | Detalle pedido |
| PATCH | `/api/orders/:id/status` | ADMIN_LOGISTICO | Cambiar estado del pedido |
| POST | `/api/payments/simulate` | COMPRADOR | Simular pago |
| GET | `/api/payments/order/:orderId` | Autenticado | Pago de un pedido |
| GET | `/api/logistics/pending-orders` | ADMIN_LOGISTICO | Pedidos pendientes |
| POST | `/api/logistics/routes` | ADMIN_LOGISTICO | Generar ruta |
| GET | `/api/logistics/routes` | ADMIN_LOGISTICO | Listar rutas |
| GET | `/api/logistics/routes/:id` | ADMIN_LOGISTICO | Detalle ruta |
| GET | `/api/traceability/:code` | Público | Trazabilidad por código |
| POST | `/api/traceability/events` | Autenticado | Agregar evento |
| GET | `/api/dashboard/summary` | Autenticado | Indicadores del rol actual |

---

## Comandos principales

```bash
# Base de datos
docker-compose up -d          # Iniciar PostgreSQL
docker-compose down           # Detener PostgreSQL

# Backend
cd backend
npm run dev                   # Desarrollo con hot-reload
npm run prisma:migrate        # Ejecutar migraciones
npm run prisma:seed           # Cargar datos de prueba
npm run prisma:studio         # Abrir Prisma Studio (GUI)
npm run build                 # Compilar para producción
npm run start                 # Ejecutar compilado (node dist/src/server.js)

# Frontend
cd frontend
npm run dev                   # Desarrollo
npm run build                 # Compilar para producción
npm run preview               # Vista previa del build
```

---

## Subir a GitHub

```bash
# Desde la raíz del proyecto
git init
git add .
git commit -m "feat: AgroEnlace MVP TRL5 v1.1 - correcciones técnicas aplicadas"
git branch -M main
git remote add origin https://github.com/tu-usuario/agroenlace-mvp.git
git push -u origin main
```

> ⚠️ El archivo `.env` está en `.gitignore`. Solo se sube `.env.example`.

---

## Notas importantes

- **Pagos 100% simulados** — ningún cargo real
- **Mapas con OpenStreetMap** — sin API key requerida
- **Algoritmo logístico:** vecino más cercano con fórmula Haversine
- **Modo offline:** usa `localStorage` del navegador
- **Transacciones Prisma:** la creación de pedidos descuenta stock de forma atómica
- Proyecto para fines **académicos** — prototipo TRL5

---

*AgroEnlace MVP TRL5 v1.1 — Prototipo funcional integrado*  
*Cundinamarca, Colombia*
