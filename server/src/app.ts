import express, { Request as ExpressRequest, Response as ExpressResponse } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import deckRouter from "./routes/deck.route";
import cardRouter from "./routes/card.route";
import env from "./env";

const app = express();

// TODO: Also try to implement CSRF protection

app.use(morgan("short", {
    skip: (_req: ExpressRequest, res: ExpressResponse) => res.statusCode < 400,
}));
app.use(cors({
    origin: env.CLIENT_HOST,
    credentials: true,
}));
app.use(cookieParser(env.COOKIE_SIGN_SECRET));
app.use(express.json());

app.options('*', cors());
app.get("/", (_req: ExpressRequest, res: ExpressResponse) => {
    res.send({ status: "success", message: "Backend API for FlashCardSystem" });
    res.end();
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/deck", deckRouter);
app.use("/card", cardRouter);

app.use((_req: ExpressRequest, res: ExpressResponse) => {
    res.status(404);
    res.json({ status: "error", message: "Resource not Found" });
    res.end();
})

export default app;
