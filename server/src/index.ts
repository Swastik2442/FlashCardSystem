// import "dotenv/config";
import express, { Express, Request, Response } from "express";
// import mongoose from "mongoose";

// if (!process.env.MONGODB_CONNECTION_URI) {
//     console.error("MONGODB_CONNECTION_URI is not set");
//     process.exit(1);
// }

const port = 2442;
const app: Express = express();

// mongoose.connect(process.env.MONGODB_CONNECTION_URI);
// const conn = mongoose.connection;

// conn.on("open", () => {
//     console.log("Connected to MongoDB!");
// });

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
    res.send({"message": "Backend API for FlashCardSystem"});
});

// const userRouter = require("./routes/users");
// app.use("/users", userRouter);

app.listen(port, () => {
    console.log(`[server]: Server is listening on port ${port}!`);
});
