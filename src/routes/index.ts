import { Router } from 'express';
import benefitsRouter from './benefits-router';

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