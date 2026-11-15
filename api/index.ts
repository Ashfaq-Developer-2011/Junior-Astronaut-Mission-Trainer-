import type { Request, Response } from 'express';
import app from '../server.js';

export default function handler(req: Request, res: Response) {
  const incomingUrl = req.url || '/';
  if (!incomingUrl.startsWith('/api')) {
    req.url = incomingUrl === '/' ? '/api' : `/api${incomingUrl.startsWith('/') ? '' : '/'}${incomingUrl}`;
  }
  return app(req, res);
}
