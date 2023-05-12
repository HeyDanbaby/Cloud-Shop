<template>
	<view :class="[empty ? '' : 'padding-lr-sm']">
		<use-navbar title="我的成员"></use-navbar>
		
		<use-loading v-if="!isload"></use-loading>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" e-type="cart" :btn-tip="false" tip="无成员数据"></use-empty>
		
		<view v-else class="padding bg-main border-radius margin-top-sm" v-for="(item, idx) in datas" :key="idx">
			<view class="dflex-b">
				<view class="dflex fxs-user">
					<view class="margin-right-sm pos-r">
						<view class="dflex-c">
							<image :src="item.member_headimg || '/static/images/user/default.png'" 
								class="border-radius-lg headimg" 
								mode="aspectFit" style="width: 88rpx; height: 88rpx;"></image>
						
							<view class="fs-xxs pos-a pos-bottom line-height-1 border-radius-xs scale-09" 
								style="bottom: -10rpx; padding: 4rpx 6rpx; transform-origin: center;"
								:class="[ item.level == 1 ? 'bg-base' : 'bg-trans' ]">{{ item.level == 1 ? '下级' : '下下级' }}</view>
						</view>
					</view>
					<view class="">
						<view class="fwb">
							{{ item.member_name || appabbr || '用云用户' }}
						</view>
						<view class="fs-xxs">
							{{ item.member_city || $api.format(item.myfxs_time, 'yyyy/MM/dd hh:mm') }}
						</view>
					</view>
				</view>
				<view class="dflex-c dflex-flow-c row-e">
					<view class="bg-base border-radius-lg fs-xxs" style="padding: 2rpx 20rpx;">
						{{item.myfxs_order_cnt || 0}}单
					</view>
					<view class="">
						<text class="fs-xxs">￥</text>
						<text class="fwb">{{ $api.format_float(item.myfxs_profit_amount / 100) || 0 }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		computed: {
			appabbr() {
				return this.$config.appabbr;
			}
		},
		data() {
			return {
				isload: false,
				empty: false,
				datas: []
			};
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			loadData() {
				
				this.$func.usemall.call('fxs/member').then(res => {
					this.isload = true;
					if (res.code == 200) {
						this.datas = res.datas;
						
						this.empty = !(this.datas && this.datas.length > 0);
						console.log('datas', this.datas)
					}
				});
				
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f5f5;
	}
	
	.fxs-user {
		.bg-base {
			background: rgba(255, 106, 108, .85);
		}
		.bg-trans {
			background: rgba(0, 0, 0, .45);
			color: #fff;
		}
	}
	
</style>
