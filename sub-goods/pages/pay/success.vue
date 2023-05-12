<template>
	<view class="dflex-flow-c">
		<use-navbar title="支付提示"></use-navbar>
		<view class="w-full" style="height: 180rpx;"></view>
		<view class="dflex-c dflex-flow-c">
			<view style="font-size: 115rpx" class="fs-big ft-base iconfont iconyiwancheng-"></view>
			<view class="title">支付成功</view>
		</view>
		<view class="padding-lr-16 dflex-c dflex-flow-c" style="margin-top: 200rpx;">
			<view class="dflex-b border-radius-big "><view class="tac padding-tb-sm flex1 bg-base" @click="toOrder" style="width: 66vw;">查看订单</view></view>
			<view class=" border-radius-big margin-tb-lg padding-lr-16"><view class="tac padding-tb-sm flex1" @click="toHome">返回首页</view></view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			order_id: ''
		};
	},
	onLoad(option) {
		this.order_id = option.order_id;
	},
	methods: {
		toOrder() {
			if (this.order_id) {
				// this.$api.toorder();
				// 跳转进入订单详情页
				uni.redirectTo({
					url: `/sub-user/pages/order/order-detail?order_id=${this.order_id}`
				});
				return;
			}
		},
		toHome() {
			this.$api.tohome();
		}
	}
};
</script>

<style lang="scss">
.title {
	font-size: 38rpx;
	color: #303133;
}
</style>
