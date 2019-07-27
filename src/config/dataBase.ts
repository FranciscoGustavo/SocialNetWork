import mongoose from 'mongoose';

class DataBase {
    private dbName: string;
    private mongoUrl: string;

    constructor() {
        this.dbName = 'mean_social';
        this.mongoUrl = 'mongodb://localhost:27017/' + this.dbName;
    }

    connect(): Promise<any> {
        return mongoose.connect(process.env.MONGODB_URL || this.mongoUrl, {
            useCreateIndex: true, 
            useNewUrlParser: true
        });
    }
}

export default new DataBase();