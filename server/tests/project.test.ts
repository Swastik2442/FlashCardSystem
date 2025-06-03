import { beforeAll, afterAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";

import app from "../src/app.js";
import env from "../src/env.js";
import User from "../src/models/user.model.js";
import Deck from "../src/models/deck.model.js";
import Card from "../src/models/card.model.js";
import { UserAccessibleRoles } from "../src/lib/featureFlags.js";
import { sampleUser1, sampleUser2, sampleDeck, sampleCard, getCookie, getCSRFToken } from "./utils.js";

const authTokens1 = { access_token: "", refresh_token: "" };
const authTokens2 = { access_token: "", refresh_token: "" };

export const setRoles = async (roles: Record<string, boolean>) => {
    const tokenRes = await getCSRFToken(app, authTokens1);
    const res = await request(app)
        .patch("/user/roles")
        .set("x-csrf-token", tokenRes.body.data)
        .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
        .send({ roles: roles });
    return res;
}

beforeAll(async () => {
    // Connect to Database
    await mongoose.connect(
        env.MONGODB_CONNECTION_URI,
        { dbName: "testing_project" }
    );

    // Register Users
    await request(app)
        .post("/auth/register")
        .send(sampleUser1);

    await request(app)
        .post("/auth/register")
        .send(sampleUser2);

    // Login Users
    const res1 = await request(app)
        .post("/auth/login")
        .send({
            username: sampleUser1.username,
            password: sampleUser1.password,
        });
    authTokens1.access_token = getCookie(res1, 0);
    authTokens1.refresh_token = getCookie(res1, 1);

    const res2 = await request(app)
        .post("/auth/login")
        .send({
            username: sampleUser2.username,
            password: sampleUser2.password,
        });
    authTokens2.access_token = getCookie(res2, 0);
    authTokens2.refresh_token = getCookie(res2, 1);
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

    it("should get the public details of multiple users", async () => {
        const users = (await User.find({
            username: { $in: [sampleUser1.username, sampleUser2.username] }
        })).map(u => JSON.parse(JSON.stringify({
            _id: u._id, fullName: u.fullName, username: u.username
        })));

        const res = await request(app)
            .get(`/user/get?usernames=${sampleUser1.username}&usernames=${sampleUser2.username}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data).toHaveLength(2);

        for (const user of users)
            expect(res.body.data).toContainEqual(user);
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
            .get("/user/substr/stus")
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Users found");
        expect(res.body.data).toHaveLength(2);
    });

    it("should get the user's liked decks", async () => {
        const res = await request(app)
            .get(`/user/liked/decks/${sampleUser1.username}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data).toHaveLength(0);
    });

    it("should change the user's name", async () => {
        const updatedUser = { fullName: "Updated User" };
        const tokenRes = await getCSRFToken(app, authTokens1);
        const res = await request(app)
            .patch("/user")
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send(updatedUser);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("User updated successfully");

        const user = await User.findOne({ username: sampleUser1.username.toLowerCase() });
        expect(user!.fullName).toBe(updatedUser.fullName);
    });

    it("should get the user's possible roles", async () => {
        const res = await request(app)
            .get("/user/roles/all")
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.data).toHaveLength(UserAccessibleRoles.length);
        expect(res.body.data).toEqual(expect.arrayContaining(UserAccessibleRoles));
    });

    it("should get the user's current roles", async () => {
        const res = await request(app)
            .get("/user/roles")
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");

        const user = await User.findOne({ username: sampleUser1.username.toLowerCase() });
        expect(res.body.data).toHaveLength(user!.roles.length);
        expect(res.body.data).toEqual(expect.arrayContaining(user!.roles));
    });

    it("should edit one of the roles of the user", async () => {
        // @ts-expect-error: UserAccessibleRoles may be empty, which is intentional for this test
        if (UserAccessibleRoles.length == 0) return;

        const userBefore = await User.findOne({ username: sampleUser1.username.toLowerCase() });
        const randomRole = UserAccessibleRoles[Math.floor(Math.random() * UserAccessibleRoles.length)];
        if (!randomRole) return;
        const rolePresentBefore = userBefore!.roles.includes(randomRole);

        const res = await setRoles({ [randomRole]: !rolePresentBefore });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");

        const userAfter = await User.findOne({ username: sampleUser1.username.toLowerCase() });
        const rolePresentAfter = userAfter!.roles.includes(randomRole)
        expect(rolePresentBefore ? !rolePresentAfter : rolePresentAfter).toBe(true);
    });
});

describe("Card Routes", () => {
    let cardId: string;

    it("should create a new card", async () => {
        const tokenRes = await getCSRFToken(app, authTokens1);
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
        const tokenRes = await getCSRFToken(app, authTokens1);
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

    it("should get not AI-generated content for the card", async () => {
        const user = await User.findOne({ username: sampleUser1.username.toLowerCase() });
        const canUseAI = user!.roles.includes("tester_genAI");
        if (canUseAI) await setRoles({ "tester_genAI": false });

        const res = await request(app)
            .get(`/card/populate/${cardId}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}}`);
        expect(res.statusCode).toBe(401);
        expect(res.body.status).toBe("error");
        expect(res.body.message).toBe("Feature not Allowed");
        expect(res.body.data).toBeNull();

        if (canUseAI) await setRoles({ "tester_genAI": true });
    });

    it("should get AI-generated content for the card", async () => {
        const user = await User.findOne({ username: sampleUser1.username.toLowerCase() });
        const cantUseAI = !(user!.roles.includes("tester_genAI"));
        if (cantUseAI) await setRoles({ "tester_genAI": true });

        const res = await request(app)
            .get(`/card/populate/${cardId}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Card Content Generated");
        expect(res.body.data).toBeDefined();
        expect(res.body.data.question).toBeDefined();
        expect(res.body.data.answer).toBeDefined();
        expect(res.body.data.hint).toBeDefined();

        if (cantUseAI) await setRoles({ "tester_genAI": false });
    });

    it("should delete the card by ID", async () => {
        const tokenRes = await getCSRFToken(app, authTokens1);
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
        const tokenRes = await getCSRFToken(app, authTokens1);
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
        const tokenRes = await getCSRFToken(app, authTokens1);
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

    it("should get all the cards in a deck", async () => {
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
        const tokenRes = await getCSRFToken(app, authTokens1);
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

    it("should add not AI-generated cards to the deck", async () => {
        const user = await User.findOne({ username: sampleUser1.username.toLowerCase() });
        const canUseAI = user!.roles.includes("tester_genAI");
        if (canUseAI) await setRoles({ "tester_genAI": false });

        const res = await request(app)
            .get(`/deck/populate/${deckId}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(401);
        expect(res.body.status).toBe("error");
        expect(res.body.message).toBe("Feature not Allowed");
        expect(res.body.data).toBeNull();

        if (canUseAI) await setRoles({ "tester_genAI": true });
    });

    it("should add AI-generated cards to the deck", async () => {
        const user = await User.findOne({ username: sampleUser1.username.toLowerCase() });
        const cantUseAI = !(user!.roles.includes("tester_genAI"));
        if (cantUseAI) await setRoles({ "tester_genAI": true });

        const cardsBefore = await Card.countDocuments({ deck: deckId });

        const res = await request(app)
            .get(`/deck/populate/${deckId}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck Content Generated");

        const cardsAfter = await Card.countDocuments({ deck: deckId });
        expect(cardsAfter).toBe(cardsBefore + 5);

        if (cantUseAI) await setRoles({ "tester_genAI": false });
    });

    it("should like the deck", async () => {
        const tokenRes = await getCSRFToken(app, authTokens1);
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

    it("should get all the users who liked the deck", async () => {
        const res = await request(app)
            .get(`/deck/likes/${deckId}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Successfully get Deck Likes");

        const deck = await Deck.findById(deckId);
        const likedBy = (deck?.likedBy ?? []).map(id => id.toString());
        expect(res.body.data).toHaveLength(likedBy.length);
        for (const user of likedBy)
            expect(res.body.data).toContain(user);
    });

    it("should unlike the deck", async () => {
        const tokenRes = await getCSRFToken(app, authTokens1);
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
        const tokenRes = await getCSRFToken(app, authTokens1);
        const res = await request(app)
            .post(`/deck/share/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send({ users: [user!._id], isEditable: false });

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
        const tokenRes = await getCSRFToken(app, authTokens1);
        const res = await request(app)
            .post(`/deck/share/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send({ users: [user!._id], isEditable: true });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck sharing updated");

        const deck = await Deck.findById(deckId);
        const accessible = deck?.isAccessibleBy(user!.id);

        expect(accessible?.readable).toBe(true);
        expect(accessible?.writable).toBe(true);
    });

    it("should get the users with whom the deck is shared", async () => {
        const deck = await Deck.findById(deckId);
        const sharedWith = (deck?.sharedTo ?? []).map(
            d => JSON.parse(JSON.stringify({
                user: d.user, isEditable: d.editable
            }))
        );

        const res = await request(app)
            .get(`/deck/share/${deckId}`)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Successfully get Shared with Users");
        expect(res.body.data).toHaveLength(sharedWith.length);

        for (const item of sharedWith)
            expect(res.body.data).toContainEqual(item)
    });

    it("should unshare the deck", async () => {
        const user = await User.findOne({ username: sampleUser2.username.toLowerCase() });
        const tokenRes = await getCSRFToken(app, authTokens1);
        const res = await request(app)
            .post(`/deck/unshare/${deckId}`)
            .set("x-csrf-token", tokenRes.body.data)
            .set("Cookie", `${authTokens1.access_token};${authTokens1.refresh_token};${getCookie(tokenRes)}`)
            .send({ users: [user!._id], unshare: true });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        expect(res.body.message).toBe("Deck sharing updated");

        const deck = await Deck.findById(deckId);
        const accessible = deck?.isAccessibleBy(user!.id);

        expect(accessible?.readable).toBe(false);
        expect(accessible?.writable).toBe(false);
    });

    it("should change the deck's owner", async () => {
        const tokenRes = await getCSRFToken(app, authTokens1);
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
        const tokenRes = await getCSRFToken(app, authTokens1);
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
