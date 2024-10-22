import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";

beforeAll(async () => {
    if (!process.env.MONGODB_CONNECTION_URI) {
        console.error("MONGODB_CONNECTION_URI is not set");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_CONNECTION_URI, { dbName: "testing" });
});

afterAll(async () => {
    // await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

var authTokens = {
    access_token: "",
    refresh_token: "",
};

describe("Auth Routes", () => {
    it("should register a new user", async () => {
        const res = await request(app).post("/auth/register").send({
            fullName: "Test User",
            email: "test@test.com",
            username: "testUser123",
            password: "321resUtset",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Registration Successful");
    });

    it("should login the user using email", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "test@test.com",
            password: "321resUtset",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Login Successful");
        expect(res.header).toHaveProperty("set-cookie");
        expect(res.headers["set-cookie"][0]).toContain("access_token");
        expect(res.headers["set-cookie"][1]).toContain("refresh_token");
        authTokens = {
            access_token: res.headers["set-cookie"][0].split(";")[0],
            refresh_token: res.headers["set-cookie"][1].split(";")[0],
        };
    });

    it("should login the user using username", async () => {
        const res = await request(app).post("/auth/login").send({
            username: "testUser123",
            password: "321resUtset",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Login Successful");
        expect(res.header).toHaveProperty("set-cookie");
        expect(res.headers["set-cookie"][0]).toContain("access_token");
        expect(res.headers["set-cookie"][1]).toContain("refresh_token");
        authTokens = {
            access_token: res.headers["set-cookie"][0].split(";")[0],
            refresh_token: res.headers["set-cookie"][1].split(";")[0],
        };
    });

    it("should refresh the user's JWT tokens", async () => {
        const res = await request(app)
        .get("/auth/refresh-token")
        .set('Cookie', `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Access Token refreshed");
        expect(res.header).toHaveProperty("set-cookie");
        expect(res.headers["set-cookie"][0]).toContain("access_token");
        expect(res.headers["set-cookie"][1]).toContain("refresh_token");
        authTokens = {
            access_token: res.headers["set-cookie"][0].split(";")[0],
            refresh_token: res.headers["set-cookie"][1].split(";")[0],
        };
    });

    it("should log out the user", async () => {
        const res = await request(app)
        .get("/auth/logout")
        .set('Cookie', `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Logout Successful");
        expect(res.header).toHaveProperty("set-cookie");
        expect(res.headers["set-cookie"][0]).toContain("access_token");
        expect(res.headers["set-cookie"][1]).toContain("refresh_token");
        authTokens = {
            access_token: res.headers["set-cookie"][0].split(";")[0],
            refresh_token: res.headers["set-cookie"][1].split(";")[0],
        };
    });
});

describe("User Routes", () => {
    it("should login the user", async () => {
        const res = await request(app).post("/auth/login").send({
            username: "testUser123",
            password: "321resUtset",
        });
        authTokens = {
            access_token: res.headers["set-cookie"][0].split(";")[0],
            refresh_token: res.headers["set-cookie"][1].split(";")[0],
        };
    });

    it("should get the user's public details", async () => {
        const res = await request(app)
        .get("/user/get/testUser123")
        .set('Cookie', `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data.fullName).toBe("Test User");
    });

    it("should get the user's liked decks", async () => {
        const res = await request(app)
        .get("/user/liked")
        .set('Cookie', `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data).toHaveLength(0);
    });
});
