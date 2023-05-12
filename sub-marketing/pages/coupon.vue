<template>
	<view class="bg-drak padding-bottom">
		<use-navbar title="领券中心"></use-navbar>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" tip="无优惠券"></use-empty>

		<view v-else class="padding-lr" v-for="(item, index) in couponDatas" :key="index" @click="togoods(item)">
			<view class="coupon-area border-radius margin-top-sm bg-main">
				<view class="dflex-b">
					<view class="left pos-a h-full dflex-c dflex-flow-c">
						<view v-if="item.type == '满减'">
							<text class="price fs-big">{{ item.price / 100 }}</text>
						</view>
						<view v-if="item.type == '折扣'">
							<text class="discount fs-big">{{ item.price / 10 }}</text>
						</view>
						<view class="fs-sm" v-if="item.order_amount > 0">满{{ item.order_amount }}元使用</view>
						<view class="fs-sm" v-else>全场通用</view>

					</view>
					<view class="right padding flex1">
						<view class="dflex-b padding-bottom-xs">
							<view class="fwb fs">{{ item.name }}</view>
						</view>
						<view class="dflex-b ft-dark fs-xs padding-bottom border-line margin-bottom-xs">
							<view class="">有效期至 {{ $api.format(item.end_time, 'yyyy-MM-dd') }}</view>
						</view>
						<view class="w-full dflex-b">
							<view class="fs-xs ft-dark padding-top-xs">{{ item.remark || '详细信息' }}</view>
							<view @tap.stop="receive(item._id)" class="dflex-b border-radius-big">
								<view class="tac padding-tb-xs padding-lr flex1 bg-base fs-xs">领取</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 上拉加载更多 -->
		<use-loadmore v-if="!empty && hasmore" :type="loadmoreType"></use-loadmore>
		
		<view class="btn-container dflex-b margin-lr pos-f border-radius-big">
			<view class="tac padding-tb-sm flex1 bg-base" @click="toExchange">我要兑换</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 加载更多状态
				loadmoreType: 'nomore', 

				// 浏览历史数据源
				couponDatas: [],
				empty: false,
				hasmore: 0,
				reqdata: {
					rows: 20,
					page: 1
				},
			};
		},
		watch: {
			couponDatas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		onPullDownRefresh() {
			this.loadData(() => {
				uni.stopPullDownRefresh();
			});
		},
		onShow() {
			this.loadData();
		},
		methods: {
			loadData(callback) {
				// 获取数据
				this.$func.usemall.call('marketing/coupon/receiveList', this.reqdata).then(res => {
					if (typeof callback === 'function') callback();
					if (res.code === 200) {
						this.couponDatas = res.datas;
					}
				});
			},
			receive(id) {
				let _this = this
				uni.showModal({
					title: '提示',
					content: '领取优惠券',
					success: function(res) {
						if (res.confirm) {
							
							_this.$func.usemall.call('marketing/coupon/receive', {
								rule_id: id
							}).then(res => {
								if (res.code === 200) {
									_this.$api.msg('领取成功');
									_this.loadData();
									return;
								}
								
								_this.$api.msg(res.msg);
							});
							
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			togoods(item) {
				return;
				this.$api.togoods({
					id: item.goods_id
				});
			},
			toExchange() {
				uni.navigateTo({
					url: '/sub-marketing/pages/coupon-exchange'
				})
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.coupon-area {
		position: relative;
	
		.left {
			background-color: $base-color;
			color: #fff;
			width: 30%;
	
			.price {
				color: #fff !important;
			}
		}
		.right {
			margin-left: 30%;
		}
		.discount {
			color: #fff;
		}
		
		.border-line {
			border-bottom: 1px dotted #ededed;
		}
	}
	
	.btn-container {
		left: 20rpx;
		right: 20rpx;
		bottom: 20rpx;
	}
</style>
