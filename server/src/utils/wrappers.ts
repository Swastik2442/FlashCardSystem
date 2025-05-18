import { Request, Response, NextFunction, RequestHandler } from 'express';

const tryCatch = (fn: RequestHandler): RequestHandler => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(
    err => {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            data: null
        });
    }
  );
};

export default tryCatch;
