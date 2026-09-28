import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<any>;

/**
 * Enterprise Async Handler Middleware
 * Wraps asynchronous Express route controllers, unwrapping returned Promises
 * and automatically catching and delegating any exceptions to the central error middleware.
 */
export const asyncHandler = <
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
