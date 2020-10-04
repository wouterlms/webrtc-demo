<template>
	<div class="input-controls">
		<select v-model="selectedAudioDevice">
			<option v-for="audioDevice of audioDevices" :key="audioDevice.deviceId" :value="audioDevice.deviceId">
				{{ audioDevice.label }}
			</option>
		</select>

		<select v-model="selectedVideoDevice">
			<option v-for="videoDevice of videoDevices" :key="videoDevice.deviceId" :value="videoDevice.deviceId">
				{{ videoDevice.label }}
			</option>
		</select>
	</div>
</template>

<script>
	export default {

		data() {
			return {
				selectedAudioDevice: null,
				selectedVideoDevice: null,
			}
		},

		watch: {
			audioDevices: function(devices) {
				if (!this.selectedAudioDevice) this.selectedAudioDevice = localStorage.getItem('selectedAudioDevice') || devices[0].deviceId;
			},

			videoDevices: function(devices) {
				if (!this.selectedVideoDevice) this.selectedVideoDevice = localStorage.getItem('selectedVideoDevice') || devices[0].deviceId;
			},

			selectedAudioDevice: function(device) {
				this.$store.commit('SET_SELECTED_AUDIO_DEVICE', device);
				localStorage.setItem('selectedAudioDevice', device);
			},

			selectedVideoDevice: function(device) {
				this.$store.commit('SET_SELECTED_VIDEO_DEVICE', device);
				localStorage.setItem('selectedVideoDevice', device);
			},
		},

		methods: {
			toggleMute() {
				this.$store.commit('SET_IS_MUTED', !this.isMuted);
			},

			toggleDisableCamera() {
				this.$store.commit('SET_IS_CAMERA_DISABLED', !this.isCameraDisabled);
			}
		},
		
		computed: {
			audioDevices() {
				return this.$store.getters.audioDevices;
			},

			videoDevices() {
				return this.$store.getters.videoDevices;
			},

			isMuted() {
				return this.$store.getters.isMuted;
			},

			isCameraDisabled(){
				return this.$store.getters.isCameraDisabled;
			}
		}
	}
</script>

<style scoped lang="scss">

.input-controls {
	position: fixed;
	top: 0;
	left: 50%;

	transform: translateX(-50%);

	max-width: 80%;

	padding: 1rem;
	@include columns(2);
	grid-gap: 2rem;

	select {
		width: 100%;
	}
}

</style>