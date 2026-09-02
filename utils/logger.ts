import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`,
    ),
  ),
  transports: [new transports.Console()],
});

export default logger;
