import { Request, Response } from "express";
import { IAuthService } from "../interfaces/IService.interface";
import { AuthValidators } from "../validators/authValidators";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const validatedDto = AuthValidators.validateRegister(req.body);
    const authData = await this.authService.register(validatedDto);
    return ApiResponse.created(res, authData, "Account created successfully.");
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const validatedDto = AuthValidators.validateLogin(req.body);
    const authData = await this.authService.login(validatedDto);
    return ApiResponse.success(res, authData, "Authentication successful.");
  });

  getDemoToken = asyncHandler(async (_req: Request, res: Response) => {
    const authData = await this.authService.getDemoUser();
    return ApiResponse.success(res, authData, "Demo session initialized.");
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    return ApiResponse.success(res, user, "Authenticated user profile retrieved.");
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    return ApiResponse.success(res, { message: "Successfully logged out." }, "Logged out.");
  });
}
