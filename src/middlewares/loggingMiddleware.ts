import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // Log incoming request
  logger.info('Incoming Request', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    query: req.query,
    body: req.body,
  });

  // Intercept response
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    
    // Log response
    logger.info('Request Completed', {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      responseSize: body?.length || 0,
    });

    return originalSend.call(this, body);
  };

  next();
} 