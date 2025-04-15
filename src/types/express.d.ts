import { Request, Response } from 'express';

declare module 'express' {
  interface Request {
    user?: any;
  }
}

export type RequestHandler = (req: Request, res: Response) => Promise<void> | void; 