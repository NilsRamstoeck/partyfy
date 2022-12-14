import { Model, model, models, Schema } from "mongoose"

interface IUser {
    email: string,
    username: string,
    access_token: string,
    refresh_token: string,
    timestamp: number,
    expires_in: number
}

const UserSchema = new Schema<IUser>({
    email: {
        required: true,
        index: true,
        unique: true,
        type: String
    },
    username:{
        required: true,
        type:String
    },
    access_token: {
        required: true,
        unique: true,
        type: String
    },
    refresh_token: {
        required: true,
        unique: true,
        type: String
    },
    timestamp: {
        default: Date.now,
        type: Number
    }
});

let UserModel:Model<IUser>;

try{
    UserModel = model<IUser>("User", UserSchema);
} catch (_) {
    UserModel = models['User']
    console.warn('Did not recompile User Model')
}

export const User = UserModel; 