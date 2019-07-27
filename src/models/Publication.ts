import { Schema, model, Document, Types } from 'mongoose';

// Plugins
const mongoosePaginate = require('mongoose-paginate-v2');

let PublicationSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        default: ""
    },
    file: {
        type: String,
        default: ""
    }
},{
    timestamps: true
});


interface IPublication extends Document {
    user: any,
    text: string,
    file: string,
    updateAt: Date,
    createdAt: Date 
}

PublicationSchema.plugin( mongoosePaginate );

const Publication = model('Publication', PublicationSchema);

export { IPublication };
export default Publication;