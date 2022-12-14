import { Model, model, models, Schema } from "mongoose"

interface IState {
    state:string,
    ip:string,
    timestamp:number,
    expires_in:number
}

const StateSchema = new Schema<IState>({
    state: {
        type: String,
        unique: true,
        required:true,
        index: true
    },
    ip:{
        type:String,
        unique:false,
        required:true,
        index:false
    },
    timestamp:{
        type: Number,
        default: Date.now
    },
    expires_in:{
        type:Number,
        default:300
    }
})

let StateModel:Model<IState>;

try{
    StateModel = model<IState>("State", StateSchema);
} catch (_) {
    StateModel = models['State']
    console.warn('Did not recompile State Model')
}

export const State = StateModel;