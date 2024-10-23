import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";

const port = process.env.PORT || 2442;
if (!process.env.MONGODB_CONNECTION_URI) {
    console.error("MONGODB_CONNECTION_URI is not set");
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_CONNECTION_URI).then((_conn) => {
    console.log("[server]: Connected to MongoDB!");
    app.listen(port, () => {
        console.log(`[server]: Server is listening on port ${port}!`);
    });
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
