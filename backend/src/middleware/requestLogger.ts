import morgan from 'morgan';
import winston from 'winston';

// Winston logger (console only)
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Streams Morgan HTTP logs through Winston so all logs go to one place
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Morgan middleware that logs each incoming HTTP request
const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

export { logger, requestLogger };