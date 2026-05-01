import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getProducerOrders,
} from '../controllers/order.controller';
import { simulatePayment, getPaymentByOrder } from '../controllers/payment.controller';
import { getPendingOrders, generateRoute, getRoutes, getRouteById } from '../controllers/logistics.controller';
import { getByCode, createEvent } from '../controllers/traceability.controller';
import { getSummary } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

export const orderRoutes = Router();
orderRoutes.post('/', authenticate, authorize('COMPRADOR'), createOrder);
orderRoutes.get('/', authenticate, authorize('ADMIN_LOGISTICO'), getOrders);
// IMPORTANT: specific routes must come before /:id
orderRoutes.get('/my-orders', authenticate, authorize('COMPRADOR'), getMyOrders);
orderRoutes.get('/producer-orders', authenticate, authorize('PRODUCTOR'), getProducerOrders);
orderRoutes.get('/:id', authenticate, getOrderById);
orderRoutes.patch('/:id/status', authenticate, authorize('ADMIN_LOGISTICO'), updateOrderStatus);

export const paymentRoutes = Router();
paymentRoutes.post('/simulate', authenticate, authorize('COMPRADOR'), simulatePayment);
paymentRoutes.get('/order/:orderId', authenticate, getPaymentByOrder);

export const logisticsRoutes = Router();
logisticsRoutes.get('/pending-orders', authenticate, authorize('ADMIN_LOGISTICO'), getPendingOrders);
logisticsRoutes.post('/routes', authenticate, authorize('ADMIN_LOGISTICO'), generateRoute);
logisticsRoutes.get('/routes', authenticate, authorize('ADMIN_LOGISTICO'), getRoutes);
logisticsRoutes.get('/routes/:id', authenticate, authorize('ADMIN_LOGISTICO'), getRouteById);

export const traceabilityRoutes = Router();
traceabilityRoutes.get('/:traceabilityCode', getByCode);
traceabilityRoutes.post('/events', authenticate, createEvent);

export const dashboardRoutes = Router();
dashboardRoutes.get('/summary', authenticate, getSummary);
