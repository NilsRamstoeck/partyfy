import { Model, model, models, Schema } from "mongoose"

interface IState {
    state:string,
    ip:string,
    timestamp:string,
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
        type:String,
        required:true,
    },
    expires_in:{
        type:Number,
        default:300
    }
})

let stateModel:Model<IState>;

try{
    stateModel = model<IState>("State", StateSchema);
} catch (_) {
    stateModel = models['State']
    console.warn('Did not recompile State Model')
}

export const State = stateModel;