import { beforeAll, afterAll, describe, expect, it } from "@jest/globals";
import { Response as superagentResponse } from "superagent";
import request from "supertest";
import mongoose from "mongoose";
import app from "@/app";
import User from "@/models/user.model";
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from "@/constants";
import env from "@/env";
import { sampleUser1 as sampleUser, getCookie, getCSRFToken } from "./utils";

const authTokens = { access_token: "", refresh_token: "" };

const setAuthTokens = (res: superagentResponse) => {
    expect(res.header).toHaveProperty("set-cookie");
    expect(res.headers["set-cookie"]?.[0]).toContain(ACCESS_TOKEN_COOKIE_NAME);
    expect(res.headers["set-cookie"]?.[1]).toContain(REFRESH_TOKEN_COOKIE_NAME);
    authTokens.access_token = getCookie(res, 0);
    authTokens.refresh_token = getCookie(res, 1);
}

beforeAll(async () => {
    await mongoose.connect(
        env.MONGODB_CONNECTION_URI,
        { dbName: "testing_auth" }
    );
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("Auth Routes", () => {
    let userID: string;

    it("should register a new user", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send(sampleUser);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Registration Successful");

        const user = await User.findOne({
            email: sampleUser.email
        }).select("-password -refreshToken -__v");
        expect(user).toBeDefined();
        expect(user!._id).toBeDefined();
        expect(user!.fullName).toBe(sampleUser.fullName);
        expect(user!.email).toBe(sampleUser.email);
        expect(user!.username).toBe(sampleUser.username.toLowerCase());
        userID = user!.id;
    });

    it("should login the user using email", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: sampleUser.email,
                password: sampleUser.password,
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Login Successful");
        expect(res.body.data).toBe(sampleUser.username.toLowerCase());
        setAuthTokens(res);
    });

    it("should login the user using username", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                username: sampleUser.username,
                password: sampleUser.password,
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Login Successful");
        expect(res.body.data).toBe(sampleUser.username.toLowerCase());
        setAuthTokens(res);
    });

    it("should refresh the user's JWT tokens", async () => {
        const res = await request(app)
            .get("/auth/refresh-token")
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Access Token refreshed");
        expect(res.body.data).toBe(sampleUser.username.toLowerCase());
        setAuthTokens(res);
    });

    it("should return a CSRF Token", async () => {
        const res = await getCSRFToken(app, authTokens);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("CSRF Token generated");
        expect(res.body.data).toBeDefined();
        expect(res.headers).toHaveProperty("set-cookie");
        expect(res.headers["set-cookie"]?.[0]).toContain("fcs.x-csrf-token");
    });

    it("should change the user's username", async () => {
        sampleUser.username += "123";
        const tokenRes = await getCSRFToken(app, authTokens);
        const res = await request(app)
            .patch("/auth/edit/username")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token};${getCookie(tokenRes)}`)
            .send({
                username: sampleUser.username,
                password: sampleUser.password
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Username changed successfully");
        expect(res.body.data).toBe(sampleUser.username.toLowerCase());

        const user = await User.findById(userID);
        expect(user).toBeDefined();
        expect(user!.username).toBe(sampleUser.username.toLowerCase());
    });

    it("should change the user's email", async () => {
        sampleUser.email = "123" + sampleUser.email;
        const tokenRes = await getCSRFToken(app, authTokens);
        const res = await request(app)
            .patch("/auth/edit/email")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token};${getCookie(tokenRes)}`)
            .send({
                email: sampleUser.email,
                password: sampleUser.password
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Email changed successfully");

        const user = await User.findById(userID);
        expect(user).toBeDefined();
        expect(user!.email).toBe(sampleUser.email);
    });

    it("should change the user's password", async () => {
        const newPassword = sampleUser.password + "123";
        const tokenRes = await getCSRFToken(app, authTokens);
        const res = await request(app)
            .patch("/auth/edit/password")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token};${getCookie(tokenRes)}`)
            .send({
                oldPassword: sampleUser.password,
                newPassword: newPassword,
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Password changed successfully");
        setAuthTokens(res);

        const user = await User.findById(userID);
        expect(user).toBeDefined();
        expect(await user?.isPasswordCorrect(newPassword)).toBe(true);
        sampleUser.password = newPassword;
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

    it("should delete the user", async () => {
        const loginRes = await request(app)
            .post("/auth/login")
            .send({
                username: sampleUser.username,
                password: sampleUser.password,
            });
            setAuthTokens(loginRes);

        const tokenRes = await getCSRFToken(app, authTokens);
        const res = await request(app)
            .delete("/auth/delete")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token};${getCookie(tokenRes)}`)
            .send({ password: sampleUser.password });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deleted the User");

        const user = await User.findById(userID);
        expect(user).toBeNull();
    });
});
