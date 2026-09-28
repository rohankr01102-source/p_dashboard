import { JwtPayload } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      requestId?: string;
      user?: any;
      token?: string;
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}
