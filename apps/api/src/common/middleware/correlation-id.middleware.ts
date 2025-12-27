import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

/**
 * Middleware to add a correlation ID to each request
 * Useful for tracing requests across logs
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use existing correlation ID from header or generate new one
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();

    // Attach to request object
    req.correlationId = correlationId;

    // Add to response headers for client tracking
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}
