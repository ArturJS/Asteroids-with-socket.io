const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3333;

const serverPrefixPath = './server/';

// import middlewares
const corsMiddleware = require(`${serverPrefixPath}middlewares/cors.middleware.js`);
const noCacheMiddleware = require(`${serverPrefixPath}middlewares/no-cache.middleware.js`);

// import routes
const apiRoute = require(`${serverPrefixPath}routes/api.route.js`);

// import sockets
const sockets = require(`${serverPrefixPath}sockets/main.js`);

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

http.listen(port, () => {
  console.log(`NODE_API listening on http://localhost:${port}/`);
});
