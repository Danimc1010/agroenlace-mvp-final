import { Router } from 'express';
import { getProducts, getProductById, getMyProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.get('/', getProducts);
router.get('/my-products', authenticate, authorize('PRODUCTOR'), getMyProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorize('PRODUCTOR'), createProduct);
router.put('/:id', authenticate, authorize('PRODUCTOR'), updateProduct);
router.delete('/:id', authenticate, authorize('PRODUCTOR'), deleteProduct);
export default router;
