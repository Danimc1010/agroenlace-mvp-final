import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error]', err.message);

  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Datos inválidos',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
    return;
  }

  res.status(500).json({ message: err.message || 'Error interno del servidor' });
};
