import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as socketio from 'socket.io';
import corsMiddleware from './middlewares/cors.middleware';
import noCacheMiddleware from './middlewares/no-cache.middleware';
import apiRoute from './routes/api.route';
import sockets from './sockets/main';
import * as path from 'path';

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

app.use('/', express.static(path.resolve(__dirname, '../build')));

//==========Socket.IO===========
sockets.init(io);

httpServer.listen(port, () => {
  console.log(`NODE_API listening on http://localhost:${port}/`);
});
