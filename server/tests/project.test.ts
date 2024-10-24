import "dotenv/config";
import { beforeAll, afterAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import User from "../src/models/user.model";
import Deck from "../src/models/deck.model";
import Card from "../src/models/card.model";

const sampleUser = {
    fullName: "Test User 2",
    email: "test2@test.com",
    username: "testUser321",
    password: "123resUtset",
};
const sampleUser2 = {
    fullName: "Test User 3",
    email: "test3@test.com",
    username: "testUser987",
    password: "789resUtset",
};

const sampleCard = {
    question: "Sample Question",
    answer: "Sample Answer",
    hint: "Sample Hint",
};

const sampleDeck = {
    name: "Sample Deck",
    description: "This is a sample deck",
    isPrivate: false,
};

let authTokens = { access_token: "", refresh_token: "" };

beforeAll(async () => {
    // Connect to Database
    if (!process.env.MONGODB_CONNECTION_URI) {
        console.error("MONGODB_CONNECTION_URI is not set");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_CONNECTION_URI, { dbName: "testing" });
    
    // Register Users
    await request(app).post("/auth/register").send(sampleUser);
    await request(app).post("/auth/register").send(sampleUser2);

    // Login the user
    const res = await request(app).post("/auth/login").send({
        username: sampleUser.username,
        password: sampleUser.password,
    });
    authTokens = {
        access_token: res.headers["set-cookie"][0].split(";")[0],
        refresh_token: res.headers["set-cookie"][1].split(";")[0],
    };
});

afterAll(async () => {
    // await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe("User Routes", () => {
    it("should get the user's public details", async () => {
        const res = await request(app)
            .get(`/user/get/${sampleUser.username}`)
            .set('Cookie', `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data.fullName).toBe(sampleUser.fullName);
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

describe("Card Routes", () => {
    let cardId: string;

    it("should create a new card", async () => {
        const res = await request(app)
            .post("/card/new")
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`)
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
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data.question).toBe(sampleCard.question);
    });

    it("should update the card by ID", async () => {
        const updatedCard = { question: "Updated Question" };
        const res = await request(app)
            .patch(`/card/${cardId}`)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`)
            .send(updatedCard);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Card updated successfully");

        const card = await Card.findById(cardId);
        expect(card!.question).toBe(updatedCard.question);
    });

    it("should delete the card by ID", async () => {
        const res = await request(app)
            .delete(`/card/${cardId}`)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Card deleted successfully");

        const card = await Card.findById(cardId);
        expect(card).toBeNull();
    });
});

describe("Deck Routes", () => {
    let deckId: string;

    it("should create a new deck", async () => {
        const res = await request(app)
            .post("/deck/new")
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`)
            .send(sampleDeck);
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck created successfully");
        expect(res.body.data).toBeDefined();
        deckId = res.body.data;
    });

    it("should get the created deck", async () => {
        const res = await request(app)
            .get(`/deck/${deckId}`)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data.name).toBe(sampleDeck.name);
        expect(res.body.data.description).toBe(sampleDeck.description);
        expect(res.body.data.isPrivate).toBe(sampleDeck.isPrivate);
        expect(res.body.data.owner).toBeDefined();
        expect(res.body.data.dateCreated).toBeDefined();
        expect(res.body.data.dateUpdated).toBeDefined();
        expect(res.body.data.cards).toHaveLength(0);
        expect(res.body.data.isEditable).toBeDefined();
        expect(res.body.data.likes).toBe(0);
    });

    it("should get all decks owned by the user", async () => {
        const res = await request(app)
            .get("/deck/all")
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
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
        const res = await request(app)
            .patch(`/deck/${deckId}`)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`)
            .send(updatedDeck);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck updated successfully");

        const deck = await Deck.findById(deckId);
        expect(deck?.name).toBe(updatedDeck.name);
    });

    it("should like the deck", async () => {
        const res = await request(app)
            .post(`/deck/likes/add/${deckId}`)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Liked the Deck");

        const deck = await Deck.findById(deckId);
        expect(deck?.likes).toBe(1);
    });

    it("should unlike the deck", async () => {
        const res = await request(app)
            .post(`/deck/likes/remove/${deckId}`)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Unliked the Deck");

        const deck = await Deck.findById(deckId);
        expect(deck?.likes).toBe(0);
    });

    it("should share the deck with read access", async () => {
        const user = await User.findOne({ username: sampleUser2.username.toLowerCase() });
        const res = await request(app)
            .post(`/deck/share/${deckId}`)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`)
            .send({ user: user?._id, isEditable: false });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck shared successfully");

        const deck = await Deck.findById(deckId);
        const accessible = deck?.isAccessibleBy(user?._id as any);

        expect(accessible?.readable).toBe(true);
        expect(accessible?.writable).toBe(false);
    });

    it("should share the deck with write access", async () => {
        const user = await User.findOne({ username: sampleUser2.username.toLowerCase() });
        const res = await request(app)
            .post(`/deck/share/${deckId}`)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`)
            .send({ user: user?._id, isEditable: true });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck shared successfully");
        
        const deck = await Deck.findById(deckId);
        const accessible = deck?.isAccessibleBy(user?._id as any);

        expect(accessible?.readable).toBe(true);
        expect(accessible?.writable).toBe(true);
    });

    it("should delete the deck", async () => {
        const res = await request(app)
            .delete(`/deck/${deckId}`)
            .set("Cookie", `${authTokens.access_token};${authTokens.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deleted the Deck");

        const deck = await Deck.findById(deckId);
        expect(deck).toBeNull();
    });
});
