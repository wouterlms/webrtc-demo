

export const state = () => ({

	isLoadingDevices: true,

	myStream: null,
	isMuted: false,
	isCameraDisabled: false,

	audioDevices: [],
	videoDevices: [],

	selectedAudioDevice: null,
	selectedVideoDevice: null,

});

export const mutations = {

	SET_IS_LOADING_DEVICES(state, payload) {
		state.isLoadingDevices = payload;
	},

	SET_MY_STREAM(state, payload) {
		state.myStream = payload;
	},

	SET_IS_MUTED(state, payload) {
		state.isMuted = payload;
	},

	SET_IS_CAMERA_DISABLED(state, payload) {
		state.isCameraDisabled = payload;
	},

	SET_AUDIO_DEVICES(state, payload) {
		state.audioDevices = payload;
	},

	ADD_AUDIO_DEVICE(state, payload) {
		state.audioDevices.push(payload);
	},

	ADD_VIDEO_DEVICE(state, payload) {
		state.videoDevices.push(payload);
	},

	SET_VIDEO_DEVICES(state, payload) {
		state.videoDevices = payload;
	},

	SET_SELECTED_AUDIO_DEVICE(state, payload) {
		state.selectedAudioDevice = payload;
	},

	SET_SELECTED_VIDEO_DEVICE(state, payload) {
		state.selectedVideoDevice = payload;
	},
	
};

export const getters = {

	isLoadingDevices(state) {
		return state.isLoadingDevices;
	},

	myStream(state) {
		return state.myStream;
	},

	isMuted(state) {
		return state.isMuted;
	},

	isCameraDisabled(state) {
		return state.isCameraDisabled;
	},

	audioDevices(state) {
		return state.audioDevices;
	},

	videoDevices(state) {
		return state.videoDevices;
	},

	selectedAudioDevice(state) {
		return state.selectedAudioDevice;
	},

	selectedVideoDevice(state) {
		return state.selectedVideoDevice;
	},
};