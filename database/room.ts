import { generatePrimeSync } from "crypto";
import { Model, model, models, Schema } from "mongoose"
import { IUser } from "./user";

export interface Song {
    name: string,
    uri: string,
    artists: Object[],
    album: string
}

//separate type in case I want to add things to it
export type RoomQueue = Song[];

export interface IRoom {
    id: string,
    host: IUser,
    members: IUser[],
    current_song: Song,
    queue: RoomQueue
}

const RoomSchema = new Schema<IRoom>({
    id: {
        type: String,
        index: true,
        unique: true,
        default: Buffer.from(generatePrimeSync(64)).toString('hex')
    },
    host: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        index: true,
        ref: 'User'
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    queue: [{
        type: {
            name: String,
            uri: String,
            album: String,
            artists: [String]
        },
        default: [],
    }]
})

RoomSchema.pre('updateOne', { document: true, query: false }, function () {
    console.log('Updating', this, JSON.stringify(this));
});

let RoomModel: Model<IRoom>;

try {
    RoomModel = model<IRoom>("Room", RoomSchema);
} catch (_) {
    RoomModel = models['Room']
    console.warn('Did not recompile Room Model')
}



export const Room = RoomModel;