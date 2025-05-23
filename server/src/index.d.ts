import mongoose from "mongoose";
import type { IUser, IUserMethods } from "./models/user.model";

type IRequestUser = Omit<IUser, "password" | "refreshToken">;

declare module "express" {
  interface Request {
    user?: mongoose.Document<unknown, unknown, IRequestUser> &
      Omit<IRequestUser & {
        _id: mongoose.Types.ObjectId;
      }, keyof IUserMethods>;
  }
}
