import mongoose from "mongoose";
import app from "./app";
import env from "./env";

mongoose.connect(env.MONGODB_CONNECTION_URI).then((_conn) => {
    console.log("[server]: Connected to MongoDB!");
    app.listen(env.PORT, () => {
        console.log(`[server]: Server is listening on port ${env.PORT}!`);
    });
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
