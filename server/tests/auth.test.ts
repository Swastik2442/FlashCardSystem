import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "@jest/globals";
import { Response as superagentResponse } from "superagent";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";

const sampleUser = {
    fullName: "Test User",
    email: "test@test.com",
    username: "testUser123",
    password: "321resUtset",
};

let authTokens = { access_token: "", refresh_token: "" };

const setAuthTokens = (res: superagentResponse) => {
    expect(res.header).toHaveProperty("set-cookie");
    expect(res.headers["set-cookie"][0]).toContain("access_token");
    expect(res.headers["set-cookie"][1]).toContain("refresh_token");
    authTokens = {
        access_token: res.headers["set-cookie"][0].split(";")[0],
        refresh_token: res.headers["set-cookie"][1].split(";")[0],
    };
}

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

describe("Auth Routes", () => {
    it("should register a new user", async () => {
        const res = await request(app).post("/auth/register").send(sampleUser);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Registration Successful");
    });

    it("should login the user using email", async () => {
        const res = await request(app).post("/auth/login").send({
            email: sampleUser.email,
            password: sampleUser.password,
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Login Successful");
        setAuthTokens(res);
    });

    it("should login the user using username", async () => {
        const res = await request(app).post("/auth/login").send({
            username: sampleUser.username,
            password: sampleUser.password,
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Login Successful");
        setAuthTokens(res);
    });

    it("should refresh the user's JWT tokens", async () => {
        const res = await request(app)
            .get("/auth/refresh-token")
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Access Token refreshed");
        setAuthTokens(res);
    });

    it("should log out the user", async () => {
        const res = await request(app)
            .get("/auth/logout")
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Logout Successful");
        setAuthTokens(res);
    });
});
