import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './middleware/requestLogger';

// Bootstraps the server by connecting to the database then starting the HTTP listener
async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`API base: /api/${env.API_VERSION}`);
  });

  // Gracefully shuts down the server and closes the database connection on termination signals
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // Catches unhandled promise rejections to prevent silent failures
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled rejection', { reason });
    process.exit(1);
  });
}

bootstrap().catch((error: unknown) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});