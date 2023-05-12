<template>
	<view :class="[empty ? '' : 'padding-lr-sm']">
		<use-navbar title="分销记录"></use-navbar>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" e-type="cart" :btn-tip="false" tip="无成员数据"></use-empty>
		
		<view class="padding bg-main border-radius margin-top-sm pos-r" v-for="(item, idx) in datas" :key="idx">
			<view class="dflex-b ">
				<view class="dflex">
					<view class="margin-right-sm">
						<image :src="item.member_headimg ||  '/static/images/user/default.png'" class="border-radius-lg headimg" style="width: 66rpx; height: 66rpx;"></image>
					</view>
					<view class="">
						<view class="fwbd">
							{{ item.member_name || appabbr || '用云用户' }}
						</view>
						<view class="fs-xxs ft-dark">
							{{ $api.format(item.create_time, 'yyyy-MM-dd hh:mm') }}
						</view>
						<view class="fs-xxs ft-dark">
							{{ item.source_desc }}
						</view>
					</view>
				</view>
				<view class="">
					￥<text class="fwb">{{item.profit_amount / 100 || 0}}</text>
				</view>
			</view>
			<view class="bg-base fs-xxs pos-a pos-top pos-right" style="border-bottom-left-radius: 20rpx; padding: 2rpx 10rpx;">
				{{item.state}}
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
				empty: false,
				datas: []
			};
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			loadData() {
				
				this.$func.usemall.call('fxs/record').then(res => {
					if (res.code == 200) {
						this.datas = res.datas.data;
						
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
	
	.ft-dark {
		color: #797979;
	}
</style>
