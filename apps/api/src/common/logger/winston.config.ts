import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

/**
 * Winston logger configuration for structured logging
 * Includes correlation ID tracking and different formats for dev/prod
 */
export const winstonConfig = WinstonModule.createLogger({
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        // Include correlation ID if present
        winston.format.printf((info) => {
          const { timestamp, level, message, context, correlationId, ...meta } = info;
          const correlationIdStr = correlationId ? ` [${correlationId}]` : '';
          const contextStr = context ? ` [${context}]` : '';
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}${correlationIdStr}${contextStr}: ${message}${metaStr}`;
        }),
        winston.format.colorize({ all: true }),
      ),
    }),

    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});
