import { Schema, model, Document, Types } from 'mongoose';

// Load Plugin
const mongoosePaginate = require('mongoose-paginate-v2');

let FollowSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User'
    },
    followed: {
        type: Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});

interface IFollow extends Document {
    user: any,
    followed: any,
    updateAt: Date,
    createdAt: Date 
}

// Plugins
FollowSchema.plugin(mongoosePaginate);

const Follow = model('Follow', FollowSchema);

export { IFollow };
export default Follow;