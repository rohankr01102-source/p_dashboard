import { Request, Response, NextFunction } from "express";

export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export interface IBaseController {
  // Marker interface for controllers
}
