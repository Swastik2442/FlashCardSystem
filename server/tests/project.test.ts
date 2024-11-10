import { beforeAll, afterAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import env from "../src/env";
import User from "../src/models/user.model";
import Deck from "../src/models/deck.model";
import Card from "../src/models/card.model";
import { sampleUser1, sampleUser2, sampleDeck, sampleCard, getCookie } from "./utils";

let authTokens1 = { access_token: "", refresh_token: "" };
let authTokens2 = { access_token: "", refresh_token: "" };

beforeAll(async () => {
    // Connect to Database
    await mongoose.connect(
        env.MONGODB_CONNECTION_URI,
        { dbName: "testing_project" }
    );

    // Get CSRF Token
    const tokenRes = await request(app).get("/csrf-token");

    // Register Users
    await request(app)
        .post("/auth/register")
        .set("x-csrf-token", tokenRes.body.data)
        .set("Cookie", getCookie(tokenRes))
        .send(sampleUser1);

    await request(app)
        .post("/auth/register")
        .set("x-csrf-token", tokenRes.body.data)
        .set("Cookie", getCookie(tokenRes))
        .send(sampleUser2);

    // Login Users
    const res1 = await request(app)
        .post("/auth/login")
        .set("x-csrf-token", tokenRes.body.data)
        .set("Cookie", getCookie(tokenRes))
        .send({
            username: sampleUser1.username,
            password: sampleUser1.password,
        });
    authTokens1 = {
        access_token: getCookie(res1, 0),
        refresh_token: getCookie(res1, 1),
    };

    const res2 = await request(app)
        .post("/auth/login")
        .set("x-csrf-token", tokenRes.body.data)
        .set("Cookie", getCookie(tokenRes))
        .send({
            username: sampleUser2.username,
            password: sampleUser2.password,
        });
    authTokens2 = {
        access_token: getCookie(res2, 0),
        refresh_token: getCookie(res2, 1),
    };
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("User Routes", () => {
    it("should get the user's public details", async () => {
        const res = await request(app)
            .get(`/user/get/${sampleUser1.username}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data.fullName).toBe(sampleUser1.fullName);
        expect(res.body.data.username).toBe(sampleUser1.username.toLowerCase());
    });

    it("should get the user's decks visible to current user", async () => {
        const res = await request(app)
            .get(`/user/decks/${sampleUser1.username}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("0 Decks found");
        expect(res.body.data).toHaveLength(0);
    });

    it("should get the users available with the matching substring", async () => {
        const res = await request(app)
            .get("/user/getsub/stus")
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Users found");
        expect(res.body.data).toHaveLength(2);
    });

    it("should get the user's liked decks", async () => {
        const res = await request(app)
            .get("/user/liked")
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data).toHaveLength(0);
    });

    it("should change the user's name", async () => {
        const updatedUser = { fullName: "Updated User" };
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .patch("/user/edit")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send(updatedUser);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("User updated successfully");

        const user = await User.findOne({ username: sampleUser1.username.toLowerCase() });
        expect(user!.fullName).toBe(updatedUser.fullName);
    });
});

describe("Card Routes", () => {
    let cardId: string;

    it("should create a new card", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post("/card/new")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send(sampleCard);
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Card created successfully");
        expect(res.body.data).toBeDefined();
        cardId = res.body.data;
    });

    it("should get the card by ID", async () => {
        const res = await request(app)
            .get(`/card/${cardId}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data._id).toBe(cardId);
        expect(res.body.data.question).toBe(sampleCard.question);
        expect(res.body.data.answer).toBe(sampleCard.answer);
        expect(res.body.data.hint).toBe(sampleCard.hint);
        expect(res.body.data.deck).toBeDefined();
    });

    it("should update the card by ID", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const updatedCard = { question: "Updated Question" };
        const res = await request(app)
            .patch(`/card/${cardId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send(updatedCard);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Card updated successfully");

        const card = await Card.findById(cardId);
        expect(card!.question).toBe(updatedCard.question);
    });

    it("should delete the card by ID", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .delete(`/card/${cardId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Card deleted successfully");

        const card = await Card.findById(cardId);
        expect(card).toBeNull();
    });
});

describe("Deck Routes", () => {
    let deckId: string, cardId: string;

    it("should create a new deck", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post("/deck/new")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send(sampleDeck);
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck created successfully");
        expect(res.body.data).toBeDefined();
        deckId = res.body.data;
    });

    it("should add a card to the deck", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post("/card/new")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
        .send({  ...sampleCard, deck: deckId });
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Card created successfully");
        expect(res.body.data).toBeDefined();
        cardId = res.body.data;
    });

    it("should get the created deck", async () => {
        const res = await request(app)
            .get(`/deck/${deckId}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data.name).toBe(sampleDeck.name);
        expect(res.body.data.description).toBe(sampleDeck.description);
        expect(res.body.data.isPrivate).toBe(sampleDeck.isPrivate);
        expect(res.body.data.owner).toBeDefined();
        expect(res.body.data.dateCreated).toBeDefined();
        expect(res.body.data.dateUpdated).toBeDefined();
        expect(res.body.data.isEditable).toBeDefined();
        expect(res.body.data.likes).toBe(0);
    });

    it("should get the cards in the deck", async () => {
        const res = await request(app)
            .get(`/deck/cards/${deckId}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("1 Cards found");
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]._id).toBe(cardId);
        expect(res.body.data[0].question).toBeDefined();
        expect(res.body.data[0].answer).toBeDefined();
        expect(res.body.data[0].hint).toBeDefined();
        expect(res.body.data[0].deck).toBeDefined();
    });

    it("should get all decks owned by the user", async () => {
        const res = await request(app)
            .get("/deck/all")
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("2 Decks found");
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data[0]._id).toBeDefined();
        expect(res.body.data[0].name).toBeDefined();
        expect(res.body.data[0].dateUpdated).toBeDefined();
        expect(res.body.data[0].isPrivate).toBeDefined();
        expect(res.body.data[1]._id).toBeDefined();
        expect(res.body.data[1].name).toBeDefined();
        expect(res.body.data[1].dateUpdated).toBeDefined();
        expect(res.body.data[1].isPrivate).toBeDefined();
    });

    it("should update the deck", async () => {
        const updatedDeck = { name: "Updated Deck Name" };
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .patch(`/deck/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send(updatedDeck);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck updated successfully");

        const deck = await Deck.findById(deckId);
        expect(deck?.name).toBe(updatedDeck.name);
    });

    it("should like the deck", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post(`/deck/likes/add/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Liked the Deck");

        const deck = await Deck.findById(deckId);
        expect(deck?.likes).toBe(1);
    });

    it("should unlike the deck", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post(`/deck/likes/remove/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Unliked the Deck");

        const deck = await Deck.findById(deckId);
        expect(deck?.likes).toBe(0);
    });

    it("should share the deck with read access", async () => {
        const user = await User.findOne({ username: sampleUser2.username.toLowerCase() });
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post(`/deck/share/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send({ user: user!._id, isEditable: false });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck sharing updated");

        const deck = await Deck.findById(deckId);
        const accessible = deck?.isAccessibleBy(user!.id);

        expect(accessible?.readable).toBe(true);
        expect(accessible?.writable).toBe(false);
    });

    it("should share the deck with write access", async () => {
        const user = await User.findOne({ username: sampleUser2.username.toLowerCase() });
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post(`/deck/share/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send({ user: user!._id, isEditable: true });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck sharing updated");
        
        const deck = await Deck.findById(deckId);
        const accessible = deck?.isAccessibleBy(user!.id);

        expect(accessible?.readable).toBe(true);
        expect(accessible?.writable).toBe(true);
    });

    it("should unshare the deck", async () => {
        const user = await User.findOne({ username: sampleUser2.username.toLowerCase() });
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .post(`/deck/unshare/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send({ user: user!._id, unshare: true });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck sharing updated");
        
        const deck = await Deck.findById(deckId);
        const accessible = deck?.isAccessibleBy(user!.id);

        expect(accessible?.readable).toBe(false);
        expect(accessible?.writable).toBe(false);
    });

    it("should change the deck's owner", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .patch(`/deck/owner/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send({ user: sampleUser2.username });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck Owner updated");

        const deck = await Deck.findById(deckId);
        const owner = await User.findById(deck!.owner);
        expect(owner!.username).toBe(sampleUser2.username.toLowerCase());
    });

    it("should delete the deck", async () => {
        const tokenRes = await request(app).get("/csrf-token");
        const res = await request(app)
            .delete(`/deck/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens2.access_token};${authTokens2.refresh_token};${getCookie(tokenRes)}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deleted the Deck");

        const deck = await Deck.findById(deckId);
        expect(deck).toBeNull();
    });
});
