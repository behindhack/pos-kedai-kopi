import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
      
      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errorMessages
        });
      }
      
      // Update req.body with the sanitized value
      if (value) {
        req.body = value;
      }
      
      next();
    } catch (e: any) {
      console.error('Validation Middleware Exception:', e);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Internal Validation Error', 
        error: e.message 
      });
    }
  };
};
