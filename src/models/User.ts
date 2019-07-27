import { Schema, model, Document  } from 'mongoose';
const mongoosePaginate = require('mongoose-paginate-v2');

let UserSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    surname: { 
        type: String, 
        default: ""
    },
    nick: { 
        type: String, 
        unique: true,
        required: true
    },
    email: { 
        type: String, 
        unique: true,
        required: true
    },
    password: { 
        type: String, 
        required: true
    },
    role: { 
        type: String, 
        default: 'ROLE_USER'
     },
    image: { 
        type: String,
        default: ""
    },
}, {
    timestamps: true
});

UserSchema.plugin(mongoosePaginate);

const User = model('User', UserSchema);

interface IUser extends Document {
    name: string,
    surname: string,
    nick: string,
    email: string,
    password: string,
    role: string,
    image: string,
    __v: number,
    updateAt: Date,
    createdAt: Date 
}

export { IUser };
export default User;