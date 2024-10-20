import express, { Request as ExpressRequest, Response as ExpressResponse } from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import deckRouter from "./routes/deck.route";
import cardRouter from "./routes/card.route";

const app = express();

app.use(cookieParser());
app.use(express.json());

app.get("/", (_req: ExpressRequest, res: ExpressResponse) => {
    res.send({ status: "success", message: "Backend API for FlashCardSystem" });
    res.end();
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/deck", deckRouter);
app.use("/card", cardRouter);

export default app;
