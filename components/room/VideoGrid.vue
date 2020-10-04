<template>
	<div class="video-grid">
		<article class="video-grid__item" v-for="(stream, i) of streams" :key="i">
			<h1>{{ stream.id }}</h1>
			<video :srcObject.prop="stream.stream" autoplay="autoplay" :muted="stream.id === 'local'" controls></video> 
		</article>
	</div>
</template>

<script>
	export default {
		props: {
			streams: Array
		}
	}
</script>

<style scoped lang="scss">

.video-grid {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;

	min-height: 100vh;

	&__item {
		position: relative;
		width: 33.333vw;
		height: 33.333vw;

		min-width: 300px;
		min-height: 300px;

		border-radius: 10px;
		padding: 2vw;
		overflow: hidden;

		h1 {
			position: absolute;
			top: 0;
			left: 0;

			padding: 3vw;
			font-weight: 500;
			color: black;
		}

		video {
			width: 100%;
			height: 100%;
			object-fit: contain;
			
			border-radius: 5px;
			box-shadow: 0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.05);
		}

	}
}

</style>