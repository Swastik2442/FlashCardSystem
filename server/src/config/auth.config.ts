import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { type ExpressAuthConfig } from "@auth/express"
import Google, { type GoogleProfile } from "@auth/express/providers/google";
import client from "@/lib/db";
import env from "@/env";

const authConfig: ExpressAuthConfig = {
    providers: [
        Google({
            profile(profile: GoogleProfile) {
                console.log("Google Profile returns", profile);
                return {
                    ...profile,
                    id: profile.id,
                    fullName: profile.name,
                    email: profile.email,
                    email_verified: profile.email_verified,
                    image: profile.picture
                }
            }
        })
    ],
    adapter: MongoDBAdapter(client, {
        collections: {
            Users: "user",
            Accounts: "account",
            Sessions: "session",
            VerificationTokens: "verificationToken"
        }
    }),
    callbacks: {
        jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        session({ session, token }) {
            if (token.id) session.user.id = token.id as string;
            return session;
        },
        signIn() {
            return `${env.CLIENT_HOST}/dashboard`;
        }
    },
    session: {
        strategy: "jwt"
    },
    basePath: "/auth/v2",
    debug: env.NODE_ENV === "development"
};

export default authConfig;
