import express, { Request, Response, NextFunction } from 'express'
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

import rooms from '../index';

router.get('/', (req: Request, res: Response) => {

	// create id
	const roomId = uuidv4();

	// add room
	rooms[roomId] = {};

	// redirect
	res.redirect(`/api/${roomId}`);
});

router.get('/:roomId', (req, res) => {
	res.status(200).send({ roomId: req.params.roomId });
});

export default router;