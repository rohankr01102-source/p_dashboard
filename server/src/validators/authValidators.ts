import { RegisterDTO, LoginDTO } from "../types/auth.types";
import { ValidationError } from "../utils/appError";

export class AuthValidators {
  static validateRegister(data: any): RegisterDTO {
    const errors: Record<string, string> = {};

    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || typeof data.email !== "string" || !emailRegex.test(data.email.trim())) {
      errors.email = "A valid email address is required.";
    }

    if (!data.password || typeof data.password !== "string" || data.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Registration validation failed", errors);
    }

    return {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      vocalType: data.vocalType || "Tenor",
      experienceLevel: data.experienceLevel || "Intermediate",
    };
  }

  static validateLogin(data: any): LoginDTO {
    const errors: Record<string, string> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || typeof data.email !== "string" || !emailRegex.test(data.email.trim())) {
      errors.email = "A valid email address is required.";
    }

    if (!data.password || typeof data.password !== "string" || data.password.length === 0) {
      errors.password = "Password is required.";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Login validation failed", errors);
    }

    return {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };
  }
}
