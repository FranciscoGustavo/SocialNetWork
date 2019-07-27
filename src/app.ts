import { json, urlencoded, Request, Response, NextFunction } from 'express';

import Server from './server';
import DataBase from './config/dataBase';

import morgan from 'morgan';

const server = Server.init(8080);


// Load Routes
import messageRoutes from './routes/messageRoutes';
import publicationRoutes from './routes/publicationRoutes';
import followRoutes from './routes/followRoutes';
import userRoutes from './routes/userRoutes';
import sessionRoutes from './routes/sessionRoutes';

// Middlewares
server.app.use( morgan('dev') );
server.app.use( urlencoded({ extended: false }) );
server.app.use( json() );

// CORS
server.app.use((req: Request, res: Response, next: NextFunction) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

	next();
});

// Use routes
server.app.use( '/api/messages', messageRoutes );
server.app.use( '/api/publications', publicationRoutes );
server.app.use( '/api/follows', followRoutes );
server.app.use( '/api/users', userRoutes );
server.app.use( '/api/sessions', sessionRoutes );

// Connect to database and start server
DataBase.connect().then(() => {
    console.log('Connected to database')
    server.start(() => console.log('Running App'));
})
.catch((error) => {
    console.log(error);
});

