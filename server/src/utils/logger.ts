import { ENV } from "../config/env";

export class Logger {
  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` | ${typeof meta === "object" ? JSON.stringify(meta) : meta}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  static info(message: string, meta?: any): void {
    if (ENV.NODE_ENV !== "test") {
      console.log(this.formatMessage("info", message, meta));
    }
  }

  static warn(message: string, meta?: any): void {
    console.warn(this.formatMessage("warn", message, meta));
  }

  static error(message: string, error?: any): void {
    console.error(this.formatMessage("error", message, error?.stack || error));
  }

  static debug(message: string, meta?: any): void {
    if (ENV.NODE_ENV === "development") {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }

  static http(methodOrMessage: string, url?: string, status?: number, durationMs?: number): void {
    if (ENV.NODE_ENV !== "test") {
      if (url !== undefined && status !== undefined && durationMs !== undefined) {
        console.log(`[HTTP] ${methodOrMessage} ${url} ${status} - ${durationMs}ms`);
      } else {
        console.log(`[HTTP] ${methodOrMessage}`);
      }
    }
  }
}
