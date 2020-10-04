<template>
	<div class="svg" v-html="svg" :style="style"></div>
</template>

<script>
	export default {
		
		props: {
			icon: {
				type: String,
				required: true,
			},

			width: {
				type: [String, Number],
				required: false,
			},

			height: {
				type: [String, Number],
				required: false,
			}
		},
	

		computed: {
			svg() {
				return require(`!html-loader!@/assets/svg/${this.icon}.svg`);
			},

			style() {
				return {
					width: this.width ?? '1rem',
					height: this.height ?? '1rem',
				}
			}
		}
	}
</script>

<style scoped lang="scss">

.svg {
	line-height: 1 !important;
}

</style>