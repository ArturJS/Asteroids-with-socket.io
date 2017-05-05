import * as express from 'express';

import roomsController from './../controllers/rooms.controller';
import loginController from './../controllers/login.controller';

const router = express.Router();

router.post('/login', loginController.doSignIn);
router.post('/logout', loginController.doSignOut);

///Rooms
router.get('/rooms', roomsController.getRooms);
router.get('/room/:roomId', roomsController.getRoomById);
router.delete('/room/:roomId', roomsController.deleteRoomById);
router.post('/room', roomsController.createRoom);

export default router;
