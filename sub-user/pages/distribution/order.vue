<template>
	<view class="pos-r" :class="[empty ? '' : 'padding-lr-sm']">
		<use-navbar title="成员订单"></use-navbar>
		
		<use-loading v-if="!isload"></use-loading>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" e-type="cart" :btn-tip="false" tip="无订单数据"></use-empty>

		<view v-else class="padding bg-main border-radius padding-top-sm margin-top-sm"
			v-for="(item, idx) in datas" :key="idx">
			<view class="dflex-b padding-bottom-xs border-line">
				<view class="dflex-c">
					<image :src="item.order_member_headimg || '/static/images/user/default.png'" 
						class="border-radius-lg margin-right-sm headimg" style="width: 56rpx; height: 56rpx;"></image>
					<view class="fs-xs">{{item.order_member_name}}</view>
				</view>
				<view class="fs-xxs line-height-1 border-radius-big" style="padding: 12rpx 14rpx; background: #333; color: #fff;">
					{{item.level == 1 ? '下级' : '下下级'}}
				</view>
			</view>
			<view class="margin-top-sm">
				<view class="dflex-b margin-tb-xs" style="align-items: flex-start;" 
					v-for="(detail, didx) in item.order_details" :key="didx">
					<image :src="detail.goods_img" class="border-radius-sm" style="width: 138rpx; height: 138rpx;"></image>
					<view class="margin-left-sm margin-top-xs flex1">
						<view class="fwbd fs-30 clamp-2">
							{{detail.goods_name}}
						</view>
						<view class="dflex-b margin-top-sm line-height-1">
							<view class="">
								<text class="price ft-black">{{ $api.format_float(detail.fxs_amount / 100)}}</text>
							</view>
							<view class="fs-xxs dflex-c">
								<text class="margin-right-sm">{{ detail.goods_sku_name || '&nbsp;&nbsp;' }}</text>
								x {{detail.goods_num}}
							</view>
						</view>
					</view>
				</view>
				
				<view class="dflex-b margin-top">
					<view class="ft-base border-radius-big fs-xxs line-height-1" style="padding: 12rpx 14rpx;">
						{{ item.is_settlement == '是' ? '已结算' : '未结算' }}
					</view>
					<view class="dflex ft-dark">
						<view class="fs-xs">
							下单 {{ $api.format(item.create_time, 'yyyy-MM-dd hh:mm') }}
						</view>
						<view class="margin-left-sm fs-xs">
							返 <text class="fs-xxs">￥</text><text class="fwbd ft-black">{{ $api.format_float(item.order_fxs_amount / 100) }}</text>
						</view>
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
				
				this.$func.usemall.call('fxs/order').then(res => {
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
</style>
