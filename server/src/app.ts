import express, { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import deckRouter from "./routes/deck.route";
import cardRouter from "./routes/card.route";
import env from "./env";

const app = express();

app.use(morgan("short", {
    skip: (_req: ExpressRequest, res: ExpressResponse) => res.statusCode < 400,
}));
app.use(cors({
    origin: env.CLIENT_HOST,
    credentials: true,
}));
app.use(helmet());
app.use(cookieParser(env.COOKIE_SIGN_SECRET));
app.use(express.json());

app.options('*', cors());
app.get("/", (_req: ExpressRequest, res: ExpressResponse) => {
    res.json({ status: "success", message: "Backend API for FlashCardSystem" });
    res.end();
});

const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => env.CSRF_TOKEN_SECRET,
    cookieName: "fcs.x-csrf-token",
    cookieOptions: { signed: true, secure: env.ENV === "production" },
    // TODO: Add getSessionIdentifier to return random uuid from jwt to identify session
});

app.get("/csrf-token", (req: ExpressRequest, res: ExpressResponse) => {
    res.json({ status: "success", message: "CSRF Token generated", data: generateToken(req, res) });
    res.end();
});

app.use(doubleCsrfProtection);
app.use((err: any, _req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    if (err == invalidCsrfTokenError) {
        res.status(403);
        res.json({ status: "error", message: "CSRF Validation failed" });
        res.end();
    } else
        next();
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/deck", deckRouter);
app.use("/card", cardRouter);

app.use((_req: ExpressRequest, res: ExpressResponse) => {
    res.status(404);
    res.json({ status: "error", message: "Resource not Found" });
    res.end();
});

export default app;
