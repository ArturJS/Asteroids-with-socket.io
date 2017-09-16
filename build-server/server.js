"use strict";
exports.__esModule = true;
var express = require("express");
var bodyParser = require("body-parser");
var http = require("http");
var socketio = require("socket.io");
var cors_middleware_1 = require("./server/middlewares/cors.middleware");
var no_cache_middleware_1 = require("./server/middlewares/no-cache.middleware");
var api_route_1 = require("./server/routes/api.route");
var main_1 = require("./server/sockets/main");
var app = express();
var httpServer = http.Server(app);
var io = socketio(httpServer);
var port = process.env.PORT || 3333; // todo add into config.ts
// init parsers
app.use(bodyParser.urlencoded({ limit: '25mb', extended: false }));
app.use(bodyParser.json({ limit: '25mb' }));
// init middlewares
app.use(cors_middleware_1["default"]);
app.use(no_cache_middleware_1["default"]);
// init routes
app.use('/api', api_route_1["default"]);
app.use('/', express.static(__dirname + '/build'));
//==========Socket.IO===========
main_1["default"].init(io);
httpServer.listen(port, function () {
    console.log("NODE_API listening on http://localhost:" + port + "/");
});
