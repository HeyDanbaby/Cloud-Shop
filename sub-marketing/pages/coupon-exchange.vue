<template>
	<view>
		<use-navbar title="兑换优惠券"></use-navbar>
		
		<view class="oper-area margin-bottom-sm pos-a pos-t-c dflex-b border-radius-big" style="top: 30%;left: 30rpx; right: 30rpx;">
			<view class="dflex-c flex1">
				<view class="icon-coupon pos-a">
					<text class="iconfont iconyouhui fs-xl"></text>
				</view>
				<input type="text" class="padding-left w-full padding-tb box-sizing-b" maxlength="6" 
					 style="border-top-right-radius: 0;border-bottom-right-radius: 0;"
					placeholder="请输入兑换码" v-model="code" />
			</view>
		
			<view class="bg-base padding-tb padding-lr-lg" @click="exchange">立即兑换</view>
		</view>
		
		<view class="bg-base border-radius-c dflex-c pos-a pos-tl-c" style="top: 60% ;width: 160rpx; height: 160rpx;" @click="scan">扫一扫</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 兑换码
				code: ''
			};
		},
		methods: {
			exchange() {
				if (!this.code.trim()) {
					this.$api.msg('请输入兑换码');
					return;
				}
				
				if (this.code.trim().length !== 6) {
					this.$api.msg('请输入正确的兑换码');
					return;
				}
				
				this.$func.usemall.call('marketing/coupon/exchange', { code: this.code })
					.then(res => {
						if (res.code == 200) {
							this.code = '';
							this.$api.msg(res.datas);
							return;
						}
						
						this.$api.msg(res.msg);
					});
			},
			scan() {
				// #ifdef H5
				this.$api.msg('当前不支持扫码，请手动输入', 2000);
				return;
				// #endif
				if (!uni.canIUse('scanCode')) {
					this.$api.msg('当前不支持扫码，请手动输入', 2000);
					return;
				}
				
				uni.scanCode({
					success: (res) => {
						this.code = res.result.substr(0, 6);
					}
				})
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: #f5f5f5;
	}
	
	.oper-area {
		input {
			padding-left: 80rpx;
			height: 102rpx;
			line-height: 102rpx;
			background-color: #fff;
		}
		
		.icon-coupon {
			top: 50%;
			left: 30rpx;
			transform: translate(0, -50%);
			z-index: 1;
		
			text {
				color: #c0c0c0;
			}
		}
	}
</style>
