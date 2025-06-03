import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import {
    Request as ExpressRequest,
    Response as ExpressResponse,
    NextFunction
} from "express";
import env from "@/env";

const ratelimit = new Ratelimit({
    redis: new Redis({
        url: env.KV_REST_API_URL,
        token: env.KV_REST_API_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(1, "120 s")
});

async function Ratelimiter(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    const id = req.locals?.session?.user?.id ?? req.ip;
    if (!id) {
        res.status(403).json({
            status: "error",
            message: "User Identifier not found",
            data: null
        });
        return;
    }

    const { success, reset } = await ratelimit.limit(id);
    if (success)
        next();
    else {
        res.status(429).set({
            "Retry-After": Math.max(0, Math.ceil((reset - new Date().getTime()) / 1000)).toString(),
            "Access-Control-Expose-Headers": "Retry-After"
        }).json({
            status: "error",
            message: "Rate limit exceeded",
            data: null
        });
    }
};

export default Ratelimiter;
