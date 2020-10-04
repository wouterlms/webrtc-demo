<template>
	<div class="join-room">
		<new-meeting></new-meeting>
	</div>
</template>

<script>

	import NewMeeting from '@/components/new-meeting/NewMeeting';

	export default {

		components: {
			'new-meeting': NewMeeting,
		},

		data() {
			return {
				roomId: null,
			}
		},

		methods: {
			joinRoom() {
				this.$router.push(`/room/${this.roomId}`);
			},
		}
	}
</script>

<style scoped lang="scss">

.join-room {
	height: 100vh;

	@include center;

	input {
		padding: .5rem;
	}
}

</style>