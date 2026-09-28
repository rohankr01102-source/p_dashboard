import { ValidationError } from "../utils/appError";

export class CommonValidators {
  static isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  static validateObjectId(id: string, fieldName: string = "id"): void {
    if (!id || !this.isValidObjectId(id)) {
      throw new ValidationError(`Invalid format for ${fieldName}: must be a 24-character hexadecimal string.`);
    }
  }

  static validatePagination(query: any): { page: number; limit: number; sortBy?: string; sortOrder?: "asc" | "desc" } {
    let page = parseInt(query.page as string, 10);
    let limit = parseInt(query.limit as string, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = 20;

    const sortBy = typeof query.sortBy === "string" ? query.sortBy : undefined;
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    return { page, limit, sortBy, sortOrder };
  }
}
