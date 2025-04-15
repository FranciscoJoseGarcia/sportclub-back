import { Request, Response } from 'express';
import { logger } from '@/utils/logger';
import axios from 'axios';

export const errorMiddleware = (err: Error, req: Request, res: Response) => {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Axios errors
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({
        status: 'error',
        message: 'Benefits API did not respond in time',
      });
    }

    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(502).json({
        status: 'error',
        message: 'Authentication error with benefits API',
      });
    }

    return res.status(502).json({
      status: 'error',
      message: 'Error communicating with benefits API',
    });
  }

  // Default error handler (errores inesperados del sistema)
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}; 