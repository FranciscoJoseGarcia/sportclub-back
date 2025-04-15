import { Request, Response } from 'express';
import { logger } from '@/utils/logger';
import axios from 'axios';

export const errorMiddleware = (err: Error, req: Request, res: Response) => {
  // Axios error (external API)
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') {
      logger.error('Timeout while consuming benefits API', {
        url: err.config?.url,
        method: err.config?.method,
        timeout: err.config?.timeout,
      });
      return res.status(504).json({
        status: 'error',
        message: 'Benefits API did not respond in time',
      });
    }

    if (err.response?.status === 404) {
      logger.warn('Benefit not found in API', {
        url: err.config?.url,
        id: req.params.id,
      });
      return res.status(404).json({
        status: 'error',
        message: 'The requested benefit does not exist',
      });
    }

    if (err.response?.status === 401 || err.response?.status === 403) {
      logger.error('Authentication error with benefits API', {
        url: err.config?.url,
        status: err.response?.status,
      });
      return res.status(502).json({
        status: 'error',
        message: 'Authentication error with benefits API',
      });
    }

    logger.error('Error while consuming benefits API', {
      status: err.response?.status,
      message: err.message,
      url: err.config?.url,
    });
    return res.status(502).json({
      status: 'error',
      message: 'Error communicating with benefits API',
    });
  }

  // 404 Error (Route not found)
  if ((err as any).status === 404) {
    logger.warn('Route not found', {
      method: req.method,
      url: req.originalUrl,
    });
    return res.status(404).json({
      status: 'error',
      message: 'Route not found',
    });
  }

  // Internal server error
  logger.error('Internal server error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}; 