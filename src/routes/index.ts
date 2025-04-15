import { Router } from 'express';
import benefitsRouter from './benefits-router';
import { logger } from '@/utils/logger';

export const routes = Router();

// Health check
routes.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Benefits routes
routes.use('/beneficios', benefitsRouter);

// Handle 404 - Route not found
routes.use((req, res) => {
  logger.warn('Route not found:', {
    method: req.method,
    path: req.path,
  });
  
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
}); 