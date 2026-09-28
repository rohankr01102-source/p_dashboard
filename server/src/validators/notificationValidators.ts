import { CommonValidators } from "./commonValidators";

export class NotificationValidators {
  static validateId(id: string): void {
    CommonValidators.validateObjectId(id, "notificationId");
  }
}
