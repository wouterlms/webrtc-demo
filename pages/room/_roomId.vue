<template>
	<div class="main">
		<video-grid :streams="streams"></video-grid>
	</div>
</template>

<script>
	import SocketIO from "socket.io-client";
	import VideoGrid from '@/components/room/VideoGrid';

	export default {

		components: {
			'video-grid': VideoGrid,
		},

		data() {
			return {
				socket: SocketIO('192.168.0.7:3000'),
				roomId: null,
				myStream: null,

				streams: [],
				connections: [],
			}
		},
		mounted() {
			this.roomId = this.$route.params.roomId;

			this.createEmptyStream();
			this.fetchMediaStream();
			this.setupSocket();
		},

		watch: {
			selectedAudioDevice: function() {
				this.fetchMediaStream();
			},

			selectedVideoDevice: function() {
				this.fetchMediaStream();
			},
		},

		methods: {

			createEmptyStream() {
				const emptyStream = () => new MediaStream([this.black(), this.silence()]);
				this.myStream = emptyStream();
			},

			fetchMediaStream() {

				const constraints = {
					video: {
						deviceId: this.selectedVideoDevice,
						frameRate: { max: 30 },
					},
					audio: {
						deviceId: this.selectedAudioDevice,
					},
				};

				navigator.mediaDevices.getUserMedia(constraints).then((stream) => {

					this.myStream = stream;
					this.addStream(this.myStream, 'local');

					this.connections.forEach(connection => {
						connection.peer.getSenders().map(sender =>
							sender.replaceTrack(this.myStream.getTracks().find(t => t.kind === sender.track.kind), this.myStream.getVideoTracks[0]));
					});
				});
			},

			silence() {
				const ctx = new AudioContext(), oscillator = ctx.createOscillator();
				const dst = oscillator.connect(ctx.createMediaStreamDestination());
				oscillator.start();

				return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false});
			},

			black() {
				const canvas = Object.assign(document.createElement("canvas"), {width: 1, height: 1});
				canvas.getContext('2d').fillRect(0, 0, 1, 1);
				const stream = canvas.captureStream();

				return Object.assign(stream.getVideoTracks()[0], {enabled: false});
			},

			setupSocket() {

				// Emit join event
				this.socket.emit('join-room', this.roomId, (cb) => {

					if (cb.error) {
						return console.log(cb);
					}
				});

				this.socket.on('user-connected', this.onUserConnected);
				this.socket.on('user-disconnected', this.onUserDisconnected);
				this.socket.on('users', this.onusersReceived);

				// WebRTC events
				this.socket.on('offer', this.handleReceiveCall);
				this.socket.on('answer', this.handleAnswer);
				this.socket.on('ice-candidate', this.handleNewIceCandidateMessage);
			},

			// Socket Events
			onUserConnected(userId) {
				// moet niet echt iets doen
			},

			onUserDisconnected(userId) {
				const stream = this.streams.filter(stream => stream.id === userId)[0];

				if (stream) {
					this.streams.splice(this.streams.indexOf(stream), 1);
				}
			},

			onusersReceived(users) {
				users.forEach((user, i) => {
					this.initiateCall(user)
				});
			},

			// WebRTC Events

			initiateCall(userId) {
				this.connections.push({
					userId,
					peer: this.createPeer(userId),
				});

				this.myStream.getTracks().forEach(track => this.getPeerById(userId).addTrack(track, this.myStream));
			},

			handleReceiveCall(incoming) {
				this.connections.push({
					userId: incoming.caller,
					peer: this.createPeer(incoming.caller),
				});
				
				const description = new RTCSessionDescription(incoming.sdp);
				const peer = this.getPeerById(incoming.caller);

				peer.setRemoteDescription(description).then(() => {
					this.myStream.getTracks().forEach(track => peer.addTrack(track, this.myStream));
				}).then(() => {
					return peer.createAnswer();
				}).then((answer) => {
					return peer.setLocalDescription(answer);
				}).then(() => {
					const payload = {
						target: incoming.caller,
						caller: this.socket.id,
						sdp: peer.localDescription,
					};

					this.socket.emit('answer', payload);
				});
			},

			handleAnswer(message) {
				const desc = new RTCSessionDescription(message.sdp);
        		this.getPeerById(message.caller).setRemoteDescription(desc);
			},

			handleNewIceCandidateMessage(incoming) {
				const candidate = new RTCIceCandidate(incoming.candidate);
				this.getPeerById(incoming.caller).addIceCandidate(candidate);
			},

			createPeer(userId) {
				const peer = new RTCPeerConnection({
					iceServers: [

					]
				});

				peer.onicecandidate = (e) => {
					if (e.candidate) {
						const payload = {
							caller: this.socket.id,
							target: userId,
							candidate: e.candidate,
						};

						this.socket.emit('ice-candidate', payload);
					}
				}

				peer.ontrack = (e) => {
					this.addStream(e.streams[0], userId);
				}

				peer.onnegotiationneeded = (e) => {

					peer.createOffer().then((offer) => {
						return peer.setLocalDescription(offer);
					}).then(() => {
						const payload = {
							target: userId,
							caller: this.socket.id,
							sdp: peer.localDescription,
						};

						this.socket.emit('offer', payload);
					});
				}

				return peer;
			},

			addStream(stream, id) {
				const existingStream = this.streams.filter(stream => stream.id === id)[0];

				if (existingStream) {
					existingStream.stream = stream;
				} else {
					this.streams.push({ stream, id });
				}
			},

			getPeerById(userId) {
				return this.connections.filter(connection => connection.userId === userId)[0].peer;
			},
		},

		computed: {

			selectedAudioDevice() {
				return this.$store.getters.selectedAudioDevice;
			},

			selectedVideoDevice() {
				return this.$store.getters.selectedVideoDevice;
			},

		}
	}
</script>

<style scoped>


</style>
