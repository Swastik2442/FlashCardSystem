import mongoose from "mongoose";

/**
 * @see https://authjs.dev/concepts/database-models
 */
export interface IAccount {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    access_token: string;
    refresh_token: string;
    expires_at: number;
    token_type: string;
    scope: string;
    id_token: string;
    session_state: string;
}

type AccountModel = mongoose.Model<IAccount>;

const accountSchema = new mongoose.Schema<IAccount, AccountModel>({
    userId: {
        type: String,
        require: true
    },
    type: {
        type: String,
        require: true
    },
    provider: {
        type: String,
        require: true
    },
    providerAccountId: {
        type: String,
        require: true
    },
    access_token: {
        type: String
    },
    refresh_token: {
        type: String
    },
    expires_at: {
        type: Number,
        require: true
    },
    token_type: {
        type: String,
        require: true
    },
    scope: {
        type: String,
        require: true
    },
    id_token: {
        type: String,
        require: true
    },
    session_state: {
        type: String,
        require: true
    }
});

export default mongoose.model("account", accountSchema);
