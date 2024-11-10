import request from "supertest";

export const sampleUser1 = {
    fullName: "Test User",
    email: "test@test.com",
    username: "testUser123",
    password: "321resUtset",
};

export const sampleUser2 = {
    fullName: "Test User 2",
    email: "test2@test.com",
    username: "testUser321",
    password: "123resUtset",
};

export const sampleCard = {
    question: "Sample Question",
    answer: "Sample Answer",
    hint: "Sample Hint",
};

export const sampleDeck = {
    name: "Sample Deck",
    description: "This is a sample deck",
    isPrivate: true,
};

export const getCookie = (res: request.Response, idx = 0) => {
    return res.headers["set-cookie"][idx].split(";")[0];
}
