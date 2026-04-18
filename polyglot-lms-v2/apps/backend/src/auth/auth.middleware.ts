import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedStr = Buffer.from(token, 'base64').toString('utf-8');
        const payload = JSON.parse(decodedStr);
        (req as any).user = { id: payload.sub, role: payload.role };
      } catch (e) {
        // silently ignore invalid tokens, let guards Handle it
      }
    }
    next();
  }
}
