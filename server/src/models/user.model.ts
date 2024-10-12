import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

interface IUser {
    fullName: string;
    email: string;
    username: string;
    password: string;
    refreshToken: string;
}

interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
    fullName: {
        type: String,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    username: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    refreshToken: {
        type: String,
        default: undefined
    },
});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))
        return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password: string){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export default mongoose.model("user", userSchema);
