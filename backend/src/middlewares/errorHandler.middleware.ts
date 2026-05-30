import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]:', err.message || err);

  // Default to 500 if status code is not set
  const statusCode = err.statusCode || err.status || 500;
  
  const response = {
    status: 'error',
    message: err.message || 'Something went wrong',
    stack: err.stack,
    errorDetail: err
  };

  res.status(statusCode).json(response);
};
