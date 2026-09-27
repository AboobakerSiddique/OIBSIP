import type { TokenRole } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        role: TokenRole;
      };
    }
  }
}

export {};
