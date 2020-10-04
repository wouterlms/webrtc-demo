import 'reflect-metadata';
import { Container } from 'typedi';
import './services';
import routes from './routes';

const config = require('../nuxt.config.js');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');

const express = require('express');
const app = express();
const socket = require('socket.io');

config.dev = process.env.NODE_ENV !== 'production';
Container.set('Logger', console);

const rooms: any = { w: null }; // w = test room

export default rooms;

async function start() {
	const nuxt = new Nuxt(config);

	const host: string = nuxt.options.server.host;
	const port: string = nuxt.options.server.port;

	await nuxt.ready();

	if (config.dev) {
		const builder = new Builder(nuxt);
		await builder.build();
	}

	app
		.use('/api', routes)
		.use(nuxt.render);

	const server = app.listen(port, host);
	const io = socket(server);

	io.on('connection', (socket: any) => {

		let _roomId: String;
		
		socket.on('join-room', (roomId: any, cb: Function) => {

			if (!rooms[roomId]) {
				// return cb({ error: 'Room does not exist!' });
			}
			
			cb({ status: 'OK' });

			_roomId = roomId;

			io.of('/').in(roomId).clients((err: any, clients: any) => {
				
				socket.join(roomId);

				// update connected users
				socket.to(roomId).broadcast.emit('user-connected', socket.id);
	
				// send connected users to new user
				io.to(socket.id).emit('users', clients);
			});
		});

		socket.on('disconnect', () => {
			socket.to(_roomId).broadcast.emit('user-disconnected', socket.id);
		});

		// WebRTC events

		socket.on('offer', (payload: any) => {
			io.to(payload.target).emit('offer', payload);
		});

		socket.on('answer', (payload: any) => {
			io.to(payload.target).emit('answer', payload);
		});

		socket.on('ice-candidate', (incoming: any) => {
			io.to(incoming.target).emit('ice-candidate', incoming);
		});
	});

	consola.ready({
		message: `Server listening on http://${host}:${port}`,
		badge: true,
	});
}
start();
