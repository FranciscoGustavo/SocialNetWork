import { Schema, model, Document, Types } from 'mongoose';
const mongoosePaginate = require('mongoose-paginate-v2');

let MessageSchema = new Schema({
    emitter: {
        type: Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        required: true
    },
    viewed: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
}); 


interface IMessage extends Document {
    emitter: any,
    receiver: any,
    text: string,
    viewed: boolean,
    updateAt: Date,
    createdAt: Date 
};

MessageSchema.plugin( mongoosePaginate );

const Message = model('Message', MessageSchema);

export { IMessage };
export default Message;