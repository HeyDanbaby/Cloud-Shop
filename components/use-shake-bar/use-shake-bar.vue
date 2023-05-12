<template>
	<view class="loader loader--slideUp">
		<text v-for="(item, idx) in datas" 
			:style="{ 'background': baseColor, 'animation-play-state': playState || play ? 'running' : 'paused' }" 
			class="loader-item">{{idx}}</text>
	</view>
</template>

<script>
	export default {
		props: {
			value: {
				type: Number,
				default: 12
			},
			play: {
				type: Boolean,
				default: true
			},
			baseColor: {
				type: String,
				default: '#fff'
			}
		},
		data() {
			return {
				playState: true
			}
		},
		computed: {
			datas() {
				if (this.value <= 3) {
					return new Array(3);
				}
				
				const step = Math.round(20 / 60 * this.value);
				
				if (this.value <= 3) {
					return new Array(3);
				}
				
				return new Array(step);
			}
		},
		methods: {
			
		},
		mounted() {
			this.$api.timerout(() => {
				this.playState = false;
			}, 800);
		}
	}
</script>

<style>
	.loader {
		overflow: hidden;
		font-size: 0;
	}

	.loader-item {
		display: inline-block;
		width: 12rpx;
		height: 30rpx;
		margin-left: 2px;
		border-radius: 30rpx;
		background-color: rgba(255, 106, 108, 0.8);
		animation-duration: 2000ms;
		animation-timing-function: cubic-bezier(0.645, 0.045, 0.355, 1);
		animation-iteration-count: infinite;
	}

	.loader-item:nth-child(1) {
		animation-delay: 100ms;
		/* transform: rotateX(60deg); */
	}
	.loader-item:nth-child(2) {
		animation-delay: 300ms;
		/* transform: rotateX(30deg); */
	}
	.loader-item:nth-child(3) {
		animation-delay: 200ms;
		/* transform: rotateX(70deg); */
	}
	.loader-item:nth-child(4) {
		animation-delay: 400ms;
		/* transform: rotateX(40deg); */
	}
	.loader-item:nth-child(5) {
		animation-delay: 500ms;
		/* transform: rotateX(50deg); */
	}
	
	.loader-item:nth-child(6) {
		animation-delay: 200ms;
		/* transform: rotateX(80deg); */
	}
	.loader-item:nth-child(7) {
		animation-delay: 600ms;
		/* transform: rotateX(10deg); */
	}
	.loader-item:nth-child(8) {
		animation-delay: 400ms;
		/* transform: rotateX(50deg); */
	}
	.loader-item:nth-child(9) {
		animation-delay: 300ms;
		/* transform: rotateX(20deg); */
	}
	.loader-item:nth-child(10) {
		animation-delay: 100ms;
		/* transform: rotateX(80deg); */
	}

	.loader-item:nth-child(11) {
		animation-delay: 200ms;
		/* transform: rotateX(0deg); */
	}
	.loader-item:nth-child(12) {
		animation-delay: 600ms;
		/* transform: rotateX(30deg); */
	}
	.loader-item:nth-child(13) {
		animation-delay: 300ms;
		/* transform: rotateX(10deg); */
	}
	.loader-item:nth-child(14) {
		animation-delay: 100ms;
		/* transform: rotateX(80deg); */
	}
	.loader-item:nth-child(15) {
		animation-delay: 200ms;
		/* transform: rotateX(8deg); */
	}
	
	.loader-item:nth-child(16) {
		animation-delay: 200ms;
		/* transform: rotateX(30deg); */
	}
	.loader-item:nth-child(17) {
		animation-delay: 600ms;
		/* transform: rotateX(20deg); */
	}
	.loader-item:nth-child(18) {
		animation-delay: 400ms;
		/* transform: rotateX(60deg); */
	}
	.loader-item:nth-child(19) {
		animation-delay: 300ms;
		/* transform: rotateX(30deg); */
	}
	.loader-item:nth-child(20) {
		animation-delay: 100ms;
		/* transform: rotateX(88deg); */
	}
	

	.loader--slideUp .loader-item {
		animation-name: slideDown;
		animation-duration: 800ms;
		animation-timing-function: linear;
	}

	@keyframes slideDown {
		0% {
			transform: rotateX(0deg);
		}

		50% {
			transform: rotateX(90deg);
		}
	}
</style>
