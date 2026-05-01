import { Router } from 'express';
import { me } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const usersRouter = Router();

// GET /api/users/me — reuses auth controller me handler
usersRouter.get('/me', authenticate, me);

export default usersRouter;
