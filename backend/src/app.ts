import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import usersRouter from './routes/users.routes';
import { orderRoutes, paymentRoutes, logisticsRoutes, traceabilityRoutes, dashboardRoutes } from './routes/index';

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'AgroEnlace API' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRouter);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/traceability', traceabilityRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
