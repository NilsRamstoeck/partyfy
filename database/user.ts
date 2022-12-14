import { Model, model, models, Schema } from "mongoose"
import { IRoom } from "./room";

export interface IUser {
    email: string,
    username: string,
    access_token: string,
    refresh_token: string,
    timestamp: number,
    expires_in: number
    room?: IRoom
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
    },
    expires_in: {
        required: true,
        type: Number
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room'
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