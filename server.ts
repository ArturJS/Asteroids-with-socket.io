import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as socketio from 'socket.io';
import corsMiddleware from './server/middlewares/cors.middleware';
import noCacheMiddleware from './server/middlewares/no-cache.middleware';
import apiRoute from './server/routes/api.route';
import sockets from './server/sockets/main';

const app = express();
const httpServer = (http as any).Server(app);
const io = socketio(httpServer);

const port = process.env.PORT || 3333; // todo add into config.ts

// init parsers
app.use(bodyParser.urlencoded({limit: '25mb', extended: false}));
app.use(bodyParser.json({limit: '25mb'}));

// init middlewares
app.use(corsMiddleware);
app.use(noCacheMiddleware);

// init routes
app.use('/api', apiRoute);


//==========Socket.IO===========
sockets.init(io);

httpServer.listen(port, () => {
  console.log(`NODE_API listening on http://localhost:${port}/`);
});
