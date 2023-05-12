<template>
	<view class="padding-lr-sm">
		<use-navbar title="拼团列表"></use-navbar>
		
		<view class="padding-sm margin-bottom-sm bg-main margin-top-sm border-radius dflex" v-for="(item,index) in [1,1,1,1,1]" :key="index">
			<view class="">
				<image src="/static/images/empty/cart.jpg" mode="aspectFill" class="margin-right-sm border-radius"
					style="width: 150rpx; height: 150rpx;"></image>
			</view>
			<view class="" style="width: 67%;">
				<view class="">
					<view class="clamp">
						水水水水水水水水水水水水水水水水水水水
					</view>
					<view class="price" style="margin: 15rpx 0 15rpx 0;">
						590
						<text class="m-price margin-left-xs">880</text>
					</view>
				</view>
				<view class="dflex-b">
					<view class="dflex">
						<view class="" v-for="(item,index) in [1,1,1]" :key="index">
							<image src="/static/images/logo.png" style="width: 50rpx;height: 50rpx;"
								class="border-radius-lg" mode="aspectFill"></image>
						</view>
					</view>
					<view class="fs-xs bg-base  border-radius-lg" style="padding: 5rpx 15rpx;">
						参与拼团
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f3f3f3;
	}
</style>
