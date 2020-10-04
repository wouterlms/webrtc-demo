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
				users: [],

				peer: null,
			}
		},

		created() {
			this.roomId = this.$route.params.roomId;
		},

		mounted() {

			const emptyStream = () => new MediaStream([this.black(), this.silence()]);

			this.myStream = emptyStream();
			// this.updateLocalVideo();

			this.fetchMediaStream();
			this.setupSocketEvents();
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
					this.addStream(stream, 'local');

					if (this.peer) {

						console.log(`Updating ${this.peer.getSenders().length} senders with my new stream...`);

						this.peer.getSenders().map(sender =>
							sender.replaceTrack(this.myStream.getTracks().find(t => t.kind === sender.track.kind), this.myStream));
					}	
				});
			},

			updateLocalVideo() {
				this.$refs.localVideo.srcObject = this.myStream;
			},

			setupSocketEvents(id) {

				// Emit join event
				this.socket.emit('join-room', this.roomId);

				// If a user connects the room you're in
				this.socket.on('user-connected', (socketId) => {
					// this.otherUser = socketId;
					this.users.push(socketId);
				});

				this.socket.on('users', (users) => {
					console.log(`There ${users.length === 1 ? 'is' : 'are'} ${users.length} ${users.length === 1 ? 'user' : 'users'} in your roomç`);

					this.users = users;
					// this.users.forEach((user, i) => {
					// 	setTimeout(() => {
					// 		this.initiateCall(user)
					// 	}, i * 2000);
					// });
				});

				// WebRTC events
				this.socket.on('offer', this.handleReceiveCall)
				this.socket.on('answer', this.handleAnswer)
				this.socket.on('ice-candidate', this.handleNewIceCandidateMessage)
			},

			initiateCall(userId) {
				console.log('Initiating call...');
				this.peer = this.createPeer(userId);
				this.myStream.getTracks().forEach(track => this.peer.addTrack(track, this.myStream));
			},

			handleReceiveCall(incoming) {
				this.peer = this.createPeer(incoming.caller);
				const description = new RTCSessionDescription(incoming.sdp);

				this.peer.setRemoteDescription(description).then(() => {
					this.myStream.getTracks().forEach(track => this.peer.addTrack(track, this.myStream));
				}).then(() => {
					return this.peer.createAnswer();
				}).then((answer) => {
					return this.peer.setLocalDescription(answer);
				}).then(() => {
					const payload = {
						target: incoming.caller,
						caller: this.socket.id,
						sdp: this.peer.localDescription,
					};

					this.socket.emit('answer', payload);
				});
			},

			handleAnswer(message) {
				const desc = new RTCSessionDescription(message.sdp);
        		this.peer.setRemoteDescription(desc);
			},

			handleNewIceCandidateMessage(incoming) {
				const candidate = new RTCIceCandidate(incoming);
				this.peer.addIceCandidate(candidate);
			},

			createPeer(userId) {

				console.log('Creating peer for', userId);

				const peer = new RTCPeerConnection({
					iceServers: [
						// {
						// 	urls: 'stun:stun.stunprotocol.org',
						// },
						// {
						// 	urls: 'turn:numb.viagenie.ca',
						// 	credential: 'muazkh',
						// 	username: 'webrtc@live.com',
						// }
					]
				});

				peer.onicecandidate = (e) => {

					if (e.candidate) {
						const payload = {
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
					this.peer.createOffer().then((offer) => {
						return this.peer.setLocalDescription(offer);
					}).then(() => {
						const payload = {
							target: userId,
							caller: this.socket.id,
							sdp: this.peer.localDescription,
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

.btns {
	margin-top: 10rem;
}

</style>