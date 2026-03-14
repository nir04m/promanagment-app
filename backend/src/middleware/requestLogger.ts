import morgan from 'morgan';
import winston from 'winston';


// Creates a Winston logger that writes structured logs to console and file
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
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Streams Morgan HTTP logs through Winston so all logs go to one place
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Morgan middleware that logs each incoming HTTP request with method, url, status and response time
const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

export { logger, requestLogger };