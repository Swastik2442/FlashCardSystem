import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().min(1024).max(49151).optional().default(2442),
    MONGODB_CONNECTION_URI: z.string().url(),
    GEMINI_API_KEY: z.string().min(1),
    KV_REST_API_URL: z.string().url(),
    KV_REST_API_TOKEN: z.string().min(1),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    ACCESS_TOKEN_EXPIRY: z.string().min(1).optional().default("30m"),
    REFRESH_TOKEN_EXPIRY: z.string().min(1).optional().default("15d"),
    CLIENT_HOST: z.string().url(),
    COOKIE_SIGN_SECRET: z.string().min(1),
    CSRF_TOKEN_SECRET: z.string().min(1),
    NODE_ENV: z.union([
        z.literal("development"),
        z.literal("testing"),
        z.literal("production"),
    ]).default("development"),
});

const env = envSchema.parse(process.env);

export default env;
