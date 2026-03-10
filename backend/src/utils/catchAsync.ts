import { Request, Response, NextFunction } from 'express';

// Wraps async route handlers to automatically forward errors to the global error handler
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;