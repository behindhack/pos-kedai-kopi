import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]:', err.message || err);

  // Default to 500 if status code is not set
  const statusCode = err.statusCode || 500;
  
  // Don't leak stack traces or raw db errors in production
  const response = {
    status: 'error',
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : (err.message || 'Something went wrong'),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};
