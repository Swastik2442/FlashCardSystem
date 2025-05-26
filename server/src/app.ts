import express, {
    Request as ExpressRequest,
    Response as ExpressResponse,
    NextFunction
} from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import compression from "compression";
import {
    getAccessToken,
    verifyAccessToken
} from "@/middlewares/auth.middleware";
import authRouter from "@/routes/auth.route";
import userRouter from "@/routes/user.route";
import deckRouter from "@/routes/deck.route";
import cardRouter from "@/routes/card.route";
import { CSRF_COOKIE_NAME } from "@/constants";
import env from "@/env";
import { randomBytes } from "crypto";

const corsOptions = {
    origin: env.CLIENT_HOST,
    credentials: true,
};

const { invalidCsrfTokenError, generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => env.CSRF_TOKEN_SECRET,
    cookieName: CSRF_COOKIE_NAME,
    cookieOptions: {
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    },
    getSessionIdentifier: (req) => {
        try {
            const token = getAccessToken(req)
            verifyAccessToken(token);
            return token;
        } catch {
            return randomBytes(32).toString("hex");
        }
    }
});

const app = express();

app.disable("x-powered-by");
app.use(morgan("short", {
    skip: (_req, res) => res.statusCode < 400,
}));

app.use(cors(corsOptions));
app.use(cookieParser(env.COOKIE_SIGN_SECRET));
app.use(express.json());
app.use(compression());

app.use((_req, res, next) => {
    res.set({
        "Content-Security-Policy":
            "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Resource-Policy": "same-origin",
        "Origin-Agent-Cluster": "?1",
        "Referrer-Policy": "no-referrer",
        "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
        "X-Content-Type-Options": "nosniff",
        "X-DNS-Prefetch-Control": "off",
        "X-Download-Options": "noopen",
        "X-Frame-Options": "SAMEORIGIN",
        "X-Permitted-Cross-Domain-Policies": "none",
        "X-XSS-Protection": "0",
    });
    next();
});

app.options('*any', cors(corsOptions));
app.get("/", (_req, res) => {
    res.json({
        status: "success",
        message: "Backend API for FlashCardSystem"
    });
    res.end();
});
app.get("/favicon.ico", (_req, res) => { res.status(204).end() });

app.get("/csrf-token", (req, res) => {
    try {
        res.json({
            status: "success",
            message: "CSRF Token generated",
            data: generateCsrfToken(req, res, { validateOnReuse: false, overwrite: true })
        });
    } catch (err: unknown) {
        console.log(err)
    }
    res.end();
});

app.use(doubleCsrfProtection);
app.use((err: unknown, _req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    if (err == invalidCsrfTokenError) {
        res.status(403);
        res.json({
            status: "error",
            message: "CSRF Validation failed"
        });
        res.end();
    } else
        next();
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/deck", deckRouter);
app.use("/card", cardRouter);

app.use((_req, res) => {
    res.status(404);
    res.json({
        status: "error",
        message: "Resource not Found"
    });
    res.end();
});

export default app;
