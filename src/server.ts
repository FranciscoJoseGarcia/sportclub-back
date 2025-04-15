import express from 'express';
import { errorMiddleware } from '@/middlewares/errorMiddleware';
import { loggingMiddleware } from '@/middlewares/loggingMiddleware';
import { corsMiddleware } from '@/middlewares/corsMiddleware';
import { logger } from '@/utils/logger';
import { SERVER } from '@/config';
import { routes } from '@/routes';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);
app.use(corsMiddleware);

app.use('/api', routes);
app.use(errorMiddleware);

// Start server
const server = app.listen(SERVER.SERVER_PORT, SERVER.SERVER_HOSTNAME, () => {
  logger.info(`Server is running on ${SERVER.SERVER_HOSTNAME}:${SERVER.SERVER_PORT}`);
});

// shutdown
export const Shutdown = (callback?: () => void) => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      callback?.();
    });
  }
}; 