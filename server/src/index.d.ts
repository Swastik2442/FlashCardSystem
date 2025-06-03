import type { IUser } from "@/models/user.model";
import type { Session } from "@auth/express";

type IRequestUser = Omit<IUser, "password" | "refreshToken">;
interface ICustomResponse<T> {
  status: "success" | "error";
  message: string;
  data?: T;
}

declare module "express" {
  interface Request {
    locals?: {
      session: Session | null;
      roles: IUser["roles"] | null;
    }
  }
  interface Response {
    json<T = unknown>(body: ICustomResponse<T>): this;
  }
}
