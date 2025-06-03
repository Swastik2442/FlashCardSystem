import env from "@/env.js";

export const GEMINI_MODEL_NAME = "gemini-2.0-flash";

const COOKIE_PREFIX = env.NODE_ENV === "production" ? "__Host-" : "";

export const ACCESS_TOKEN_COOKIE_NAME = COOKIE_PREFIX + "fcs.access-token";
export const REFRESH_TOKEN_COOKIE_NAME = COOKIE_PREFIX + "fcs.refresh-token";
export const CSRF_COOKIE_NAME = COOKIE_PREFIX + "fcs.x-csrf-token";

export const UNCATEGORISED_DECK_NAME = "#UNCATEGORISED#";
