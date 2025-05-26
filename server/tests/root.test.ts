import { beforeAll, afterAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "@/app";
import env from "@/env";

beforeAll(async () => {
    await mongoose.connect(
        env.MONGODB_CONNECTION_URI,
        { dbName: "testing_root" }
    );
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("Root Routes", () => {
    it("should return the basic response", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Backend API for FlashCardSystem");
    });

    it("should return HTTP status 204 for favicon.ico", async () => {
        const res = await request(app).get("/favicon.ico");
        expect(res.statusCode).toBe(204);
    });

    it("should check for CORS preflight", async () => {
        const res = await request(app).options("/");
        expect(res.statusCode).toBe(204);
        expect(res.headers).toHaveProperty("access-control-allow-origin");
        expect(res.headers).toHaveProperty("access-control-allow-methods");
        expect(res.headers).toHaveProperty("access-control-allow-credentials");
    });

    it("should return a CSRF Token", async () => {
        const res = await request(app).get("/csrf-token");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("CSRF Token generated");
        expect(res.body.data).toBeDefined();
        expect(res.headers).toHaveProperty("set-cookie");
        expect(res.headers["set-cookie"][0]).toContain("fcs.x-csrf-token");
    });

    it("should return HTTP status 404 for an unknown route", async () => {
        const res = await request(app).get("/notarouteweshouldhave2442");
        expect(res.statusCode).toBe(404);
        expect(res.body.status).toBe("error");
        expect(res.body.message).toBe("Resource not Found");
    });
});
