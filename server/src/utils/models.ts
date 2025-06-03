import User from "../models/user.model.js"

const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

export const getUserWith = async (username: string) => {
    let user;
    if (username.length === 24 && checkForHexRegExp.test(username)) // ID
        user = await User.findById(username).select("-password -refreshToken");
    if (!user) {
        user = await User.findOne({                                 // Username
            username: username.toLowerCase()
        }).select("-password -refreshToken");
        if (!user) return null;
    }
    return user;
}

export const getUsersWith = async (usernames: string[]) => {
    if (usernames.length < 1 || !usernames[0])
        throw new Error("At least one username should be present");

    let users;
    if (usernames[0].length === 24 && checkForHexRegExp.test(usernames[0])) // IDs
        users = await User.find({ _id: { $in: usernames } }).select("-password -refreshToken");
    if (!users) {
        users = await User.find({                                           // Usernames
            username: { $in: usernames.map((u: string) => u.toLowerCase()) }
        }).select("-password -refreshToken");
        if (!users || users.length != usernames.length)
            return null;
    }
    return users;
}
