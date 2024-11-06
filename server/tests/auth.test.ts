import { beforeAll, afterAll, describe, expect, it } from "@jest/globals";
import { Response as superagentResponse } from "superagent";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "../src/constants";
import env from "../src/env";

const sampleUser = {
    fullName: "Test User",
    email: "test@test.com",
    username: "testUser123",
    password: "321resUtset",
};

let authTokens = { access_token: "", refresh_token: "" };

const getCookie = (res: request.Response, idx: number = 0) => {
    return res.headers["set-cookie"][idx].split(";")[0];
}

const setAuthTokens = (res: superagentResponse) => {
    expect(res.header).toHaveProperty("set-cookie");
    expect(res.headers["set-cookie"][0]).toContain(ACCESS_TOKEN_COOKIE_NAME);
    expect(res.headers["set-cookie"][1]).toContain(REFRESH_TOKEN_COOKIE_NAME);
    authTokens = {
        access_token: getCookie(res, 0),
        refresh_token: getCookie(res, 1),
    };
}

beforeAll(async () => {
    await mongoose.connect(env.MONGODB_CONNECTION_URI, { dbName: "testing_auth" });
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

    it("should return a CSRF Token", async () => {
        const res = await request(app).get("/csrf-token");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("CSRF Token generated");
        expect(res.body.data).toBeDefined();
        expect(res.header).toHaveProperty("set-cookie");
        expect(res.headers["set-cookie"][0]).toContain("fcs.x-csrf-token");
    });
});

describe("Auth Routes", () => {
    it("should register a new user", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post("/auth/register")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", getCookie(tokenRes))
            .send(sampleUser);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Registration Successful");
    });

    it("should login the user using email", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post("/auth/login")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", getCookie(tokenRes))
            .send({
                email: sampleUser.email,
                password: sampleUser.password,
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Login Successful");
        setAuthTokens(res);
    });

    it("should login the user using username", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post("/auth/login")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", getCookie(tokenRes))
            .send({
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
