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
    
    // it("should login the user", async () => {
    //     const res = await request(app).post("/auth/login").send({
    //         email: "test@test.com",
    //         username: "testUser123",
    //         password: "321resUtset",
    //     });
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.status).toBe("success");
    //     expect(res.body.message).toBe("Login Successful");
    // });

    // it("should refresh the user's JWT tokens", async () => {
    //     const res = await request(app).get("/auth/refresh-token");
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.status).toBe("success");
    //     expect(res.body.message).toBe("Access Token refreshed");
    // });

    // it("should log out the user", async () => {
    //     const res = await request(app).get("/auth/logout");
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.status).toBe("success");
    //     expect(res.body.message).toBe("Logout Successful");
    // });
});

describe("User Routes", () => {
    it("should get the user's public details", async () => {
        const res = await request(app).get("/user/get/testUser123");
        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data.fullName).toBe("Test User");
    });

    // it("should get the user's liked decks", async () => {
    //     const res = await request(app).get("/user/liked");
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.status).toBe("success");
    //     expect(res.body.data).toBe([]);
    // });
});
