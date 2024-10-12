import "dotenv/config";
import express, { Request as ExpressRequest, Response as ExpressResponse } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route";

if (!process.env.MONGODB_CONNECTION_URI) {
    console.error("MONGODB_CONNECTION_URI is not set");
    process.exit(1);
}

const port = 2442;
const app = express();

mongoose.connect(process.env.MONGODB_CONNECTION_URI);
const conn = mongoose.connection;

conn.on("open", () => {
    console.log("Connected to MongoDB!");
});

app.use(cookieParser());
app.use(express.json());

app.get("/", (_req: ExpressRequest, res: ExpressResponse) => {
    res.send({ status: "success", message: "Backend API for FlashCardSystem" });
});

app.use("/auth", authRouter);

app.listen(port, () => {
    console.log(`[server]: Server is listening on port ${port}!`);
});
