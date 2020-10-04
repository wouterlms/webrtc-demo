<template>
	<div class="new-meeting">
		
		<div class="new-meeting__controls">
			<button @click="createRoom()">
				<span>
					<v-svg icon="camera" width="1.2rem" height="1.2rem"></v-svg>
				</span>

				<span>New Room</span>
			</button>

			<button @click="joinRoom()">
				<span>
					<v-svg icon="plus" width="1.2rem" height="1.2rem"></v-svg>
				</span>

				<span>Join Room</span>
			</button>
		</div>

	</div>
</template>

<script>

	import Svg from '@/components/global/Svg';

	export default {
		components: {
			'v-svg': Svg,
		},

		methods: {
			createRoom() {
				fetch('/api')
					.then(async res => {
						const data = await res.json();
						this.$router.push(`/room/${data.roomId}`);
					});
			},

			joinRoom() {
				
			},
		}
	}
</script>

<style scoped lang="scss">

.new-meeting {

	padding: 2rem;
	background: $primary-light;
	border-radius: 10px;
	box-shadow: 0 3px 6px rgba(0,0,0,0.05), 0 3px 6px rgba(0,0,0,0.1);

	&__controls {

		@include columns(2);

		button {
			background: transparent;
			border: none;

			display: flex;
			align-items: center;

			transition: .3s;

			&:not(:last-of-type) {
				padding-right: 1.5rem;
			}

			span {
				&:nth-of-type(1) {
					background: $primary-accent;
					padding: 1.1rem;
					border-radius: 50%;

					::v-deep svg {
						transition: .3s;
					}
				}

				&:nth-of-type(2) {
					margin-left: .5rem;
					color: transparentize($secondary-accent, .2);
					font-weight: 600;
				}
			}

			&:hover ::v-deep svg {
				transform: scale(1.07);
			}
		}

		&:hover button:not(:hover) {
			opacity: .5;
		}
	}
}

@media screen and (max-width: 500px) {

	.new-meeting {
		box-shadow: none;
		font-size: 90%;

		&__controls {
		}
	}

}

</style>