<template>
	<div>
		<nuxt/>
		<input-controls></input-controls>
	</div>
</template>

<script>

	import InputControls from '@/components/page/InputControls';

	export default {

		components: {
			'input-controls': InputControls
		},

		async mounted() {
			await this.fetchAudioDevices();
			await this.fetchVideoDevices();

			this.$store.commit('SET_IS_LOADING_DEVICES', false);

			navigator.mediaDevices.addEventListener('devicechange', this.onDeviceChange);
		},

		methods: {
			async fetchAudioDevices() {
				this.$store.commit('SET_AUDIO_DEVICES', []);

				return new Promise(async resolve => {
					const devices = await navigator.mediaDevices.enumerateDevices();

					devices.forEach((device) => {
						if (device.kind === 'audioinput') {
							this.$store.commit('ADD_AUDIO_DEVICE', device);
						}
					});

					resolve(true);
				});
			},

			async fetchVideoDevices() {
				this.$store.commit('SET_VIDEO_DEVICES', []);

				return new Promise(async resolve => {
					const devices = await navigator.mediaDevices.enumerateDevices();

					devices.forEach((device) => {
						if (device.kind === 'videoinput') {
							this.$store.commit('ADD_VIDEO_DEVICE', device);
						}
					});

					resolve(true);
				});
			},

			onDeviceChange() {
				this.fetchAudioDevices()
				this.fetchVideoDevices();
			}
		}
	};

</script>

<style lang="scss">

body {
	font-family: 'Poppins', sans-serif;
	background: $primary-light;

	overflow-x: hidden;
	width: 100%;
}

* {
	font-family: 'Poppins', sans-serif;
}

*,
*::before,
*::after {
	box-sizing: border-box;
	-webkit-tap-highlight-color: rgba(0,0,0,0);
}

p {
    line-height: 1.7;
}

img {
    width: 100%;
	height: 100%;
	
    object-fit: cover;
}

h1 {
    line-height: 1.3;
}

h1, h2, h3, h4, h5, h6, p, li, a, span, button, input {
	color: $primary-dark;
}

</style>
