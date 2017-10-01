const {Server} = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const corsMiddleware = require('./middlewares/cors.middleware.js');
const noCacheMiddleware = require('./middlewares/no-cache.middleware.js');
const apiRoute = require('./routes/api.route.js');
const sockets = require('./sockets/main');

const app = express();
const httpServer = Server(app);
const io = socketio(httpServer);

const port = process.env.PORT || 3333; // todo add into config.js

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
