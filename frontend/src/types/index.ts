export type Role = 'PRODUCTOR' | 'COMPRADOR' | 'ADMIN_LOGISTICO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  producerProfile?: ProducerProfile;
  buyerProfile?: BuyerProfile;
}

export interface ProducerProfile {
  id: string;
  userId: string;
  farmName: string;
  municipality: string;
  village?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  buyerType?: string;
  city?: string;
  address?: string;
}

export type ProductStatus = 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO' | 'INACTIVO';

export interface Product {
  id: string;
  producerId: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  municipality: string;
  harvestDate?: string;
  status: ProductStatus;
  imageUrl?: string;
  createdAt: string;
  producer?: ProducerProfile & { user?: { name: string } };
}

export type OrderStatus = 'PENDIENTE' | 'CONFIRMADO' | 'EN_RECOLECCION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
export type PaymentStatus = 'PENDIENTE' | 'PAGADO' | 'FALLIDO' | 'SIMULADO';
export type PaymentMethod = 'NEQUI' | 'DAVIPLATA' | 'PSE' | 'CONTRAENTREGA';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: string;
  buyerId: string;
  status: OrderStatus;
  total: number;
  deliveryAddress?: string;
  paymentStatus: PaymentStatus;
  traceabilityCode: string;
  createdAt: string;
  buyer?: { name: string; email: string };
  items?: OrderItem[];
  traceabilityEvents?: TraceabilityEvent[];
  payment?: Payment;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionReference?: string;
  paidAt?: string;
  createdAt: string;
}

export interface TraceabilityEvent {
  id: string;
  orderId: string;
  title: string;
  description?: string;
  location?: string;
  createdAt: string;
}

export interface RouteStop {
  id: string;
  stopOrder: number;
  latitude: number;
  longitude: number;
  address?: string;
  municipality?: string;
  producer?: ProducerProfile & { user?: { name: string } };
  order?: Order;
}

export interface RoutePlan {
  id: string;
  code: string;
  status: string;
  totalDistanceKm?: number;
  createdAt: string;
  stops?: RouteStop[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OfflineProduct {
  tempId: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  municipality: string;
  harvestDate?: string;
  savedAt: string;
}
