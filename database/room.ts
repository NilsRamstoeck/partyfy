import { generatePrimeSync } from "crypto";
import { Model, model, models, Schema } from "mongoose"
import { IUser } from "./user";

export interface IRoom {
    id: string,
    host: IUser,
    members: IUser[]
}

const RoomSchema = new Schema<IRoom>({
    id: {
        type: String,
        index:true,
        unique: true,
        default: Buffer.from(generatePrimeSync(64)).toString('hex')
    },
    host: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        index: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
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