<template>
	<view class="container">
		<use-navbar title="退款/退换货"></use-navbar>
		
		<!-- 订单状态区 -->
		<scroll-view scroll-x scroll-anchoring scroll-with-animation class="ws-np" :scroll-left="scrollLeft">
			<view class="state-area dflex navbar-area">
				<view class="nav-item padding-lr dflex-c pos-r fs h-full" :class="{ active: tabCurrentIndex === idx }"
					v-for="(item, idx) in navList" :key="idx" @click="tabClick(idx)">
					{{ item.state }}
				</view>
			</view>
		</scroll-view>

		<!-- 订单轮播区 -->
		<swiper class="swiper-area w-full" :duration="0" :current="tabCurrentIndex" @change="changeTab">
			<!-- 轮播项对应订单状态 -->
			<swiper-item class="tab-content wh-full" v-for="(tabItem, tabIndex) in navList" :key="tabIndex">
				<!-- 滚动区 -->
				<scroll-view class="h-full" scroll-y @scrolltolower="loadData">
					<!-- 空白页 -->
					<use-empty v-if="tabItem.orderList.length === 0 && tabItem.loaded" e-style="round" e-type="cart"
						tip="订单数据为空" height="93vh"></use-empty>
					<!-- 订单列表区 -->
					<view class="padding-lr margin-bottom-sm" :class="index === 0 ? 'padding-top-sm' : ''"
						v-for="(item, index) in tabItem.orderList" :key="index">
						<!-- 订单项 -->
						<view class="order-item padding bg-main border-radius">
							<view @click="toDetail(item.aftersale)">
								<!-- 订单商品明细 -->
								<view class="goods-area pos-r" :class="{ 'margin-top': goodsIndex > 0 }"
									v-for="(goodsItem, goodsIndex) in item.orderDetails" :key="goodsIndex">
									<image :src="goodsItem.goods_sku_img || goodsItem.goods_img" mode="aspectFill" class="border-radius"></image>
									<view class="right flex1">
										<text class="clamp-2">{{ goodsItem.goods_name }}
											{{ goodsItem.goods_name_pw }}</text>
										<view class="ft-dark fs-xs padding-top-xs">
											<text class="margin-right-sm">× {{goodsItem.goods_num}}</text>
											{{ goodsItem.goods_sku_name || '&nbsp;&nbsp;' }}
										</view>
										<view class="margin-top-sm dflex-b">
											<text class="price ft-main fs-sm">{{ goodsItem.goods_amount / 100}}</text>
											
											<text>{{goodsAftersaleState(item)}}</text>
										</view>
									</view>
									<view v-if="goodsItem.is_vip === '是'" class="use-tag pos-a pos-top bg-base margin-right-sm">会员价</view>
								</view>
								
								<!-- 售后原因 -->
								<view v-if="item.aftersale" class="margin-top-sm bg-drak padding-lr padding-tb-sm border-radius" style="color: #525252;">
									<text v-if="item.aftersale.state === '待处理'" class="clamp-lh">售后原因: {{item.aftersale.reason}}</text>
									<text v-else-if="item.aftersale.state === '已完成' && ['退款', '退货'].includes(item.aftersale.type)" class="clamp-lh">已退款，{{item.aftersale.refund_way}} ￥{{(item.aftersale.refund_rebate || item.aftersale.refund_amount) / 100}}</text>
									<text v-else-if="item.aftersale.state === '已完成' && ['换货'].includes(item.aftersale.type)" class="clamp-lh">换货商品已签收</text>
									<text v-else-if="item.aftersale.sub_state === '待寄回'" class="clamp-lh">商家已同意，待寄回{{item.aftersale.type}}商品</text>
									<text v-else-if="item.aftersale.sub_state === '待收货'" class="clamp-lh">{{item.aftersale.type}}商品已寄回，待商家收货</text>
									<text v-else-if="item.aftersale.sub_state === '待签收'" class="clamp-lh">{{item.aftersale.type}}商品商家已发货，请注意查收</text>
									<text v-else-if="item.aftersale.state === '已拒绝'" class="clamp-lh">{{item.aftersale.type}}申请商家已拒绝，可重新申请售后</text>
									<text v-else-if="item.aftersale.state === '已取消'" class="clamp-lh">{{item.aftersale.type}}申请已取消，可重新申请售后</text>
								</view>
							</view>

							<!-- 订单操作区 -->
							<view class="dflex-b margin-top-sm">
								<view>
									<!-- 当前售后类型 -->
									<text class="ft-dark">{{item.aftersale.type}}</text>
								</view>

								<view class="dflex-e">
									<view v-if="item.aftersale.state == '待处理'" class="dflex">
										<button class="action-btn border-radius-big bg-main"
											@click="cancelOrderAftersale(item)">取消售后</button>
									</view>
									<view v-else-if="['已取消', '已完成', '已拒绝'].includes(item.aftersale.state)" class="dflex">
										<button class="action-btn border-radius-big bg-main main-btn" 
											@click="delOrderAftersale(item)">删除售后</button>
									</view>
									<view v-else class="dflex">
										<button class="action-btn border-radius-big bg-main"
											@click="toDetail(item.aftersale)">查看售后</button>
									</view>
									
									<view v-if="['待签收'].includes(item.aftersale.sub_state)" class="dflex">
										<button class="action-btn border-radius-big bg-main main-btn" 
											@click="toReceipt(item.aftersale)">确认收货</button>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 上拉加载更多 -->
					<use-loadmore v-if="tabItem.orderList.length > 0 && tabItem.loaded && tabItem.hasmore"
						:type="tabItem.loadingType"></use-loadmore>
				</scroll-view>
			</swiper-item>
		</swiper>
		
	</view>
</template>


<script>
	import {
		mapState
	} from 'vuex';

	export default {
		data() {
			return {
				tabCurrentIndex: 0,
				tabEles: [],
				navData: {},
				navList: [{
						id: 0,
						state: '全部',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 1,
						state: '售后中',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 2,
						state: '已售后',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 3,
						state: '已取消',
						loadingType: 'more',
						orderList: []
					}
				],
				reqdata: {
					page: 1,
					rows: 10,
					aftersale: 1
				},
				scrollLeft: 0,
				title: '全部',
				curData: {},
				screenWidth: 0
			};
		},
		watch: {
			tabCurrentIndex(nv, ov) {
				this.loadData('tab_change', 1);
				
				// 计算 scrollLeft
				this.calcScrollLeft(nv);
			}
		},
		onShow(options) {
			if (!this.islogin) {
				uni.showModal({
					title: '授权登录',
					success: (res) => {
						if (res.confirm) {
							this.$api.tologin();
							return;
						} 
						
						this.$api.tohome();
					}
				});
				return;
			}

			let state = '';

			uni.getStorage({
				key: '__order_state',
				success: (res) => {
					state = res.data;

					let cur_nav = this.navList.find(x => x.state == state);
					if (cur_nav) {
						this.tabCurrentIndex = cur_nav.id;
					}

					uni.removeStorage({
						key: '__order_state'
					});
				},
				complete: () => {
					this.loadData('refresh');
				}
			});
		},

		onLoad(options) {
			uni.$on('__event_order', res => {
				if (res == 'refresh') {
					this.loadData('refresh');
				}
			});
			
			this.$api.get_env(res => {
				this.screenWidth = res.screenWidth;
				console.log('this.screenWidth', this.screenWidth);
			});
			
			this.$nextTick(async () => {
				this.tabEles = [];
				const view = uni.createSelectorQuery().in(this);
				view.selectAll(`.nav-item`)
					.boundingClientRect(datas => {
						this.tabEles = Object.freeze(datas);
						console.log('tabEles', this.tabEles);
						this.calcScrollLeft(this.tabCurrentIndex);
					})
					.exec()
			});
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.loadData('refresh');
		},
		// 上拉加载更多
		onReachBottom() {
			this.loadData();
		},
		computed: {
			...mapState(['islogin'])
		},
		methods: {
			// 获取订单列表
			async loadData(source = 'add', loading) {
				// 获取当前 nav
				let cur_nav = this.navList[this.tabCurrentIndex];
				this.title = cur_nav.state;
				console.log(this.title);
				console.log('loadData cur_nav', cur_nav);

				if (cur_nav.loadingType === 'loading') {
					//防止重复加载
					return;
				}

				this.reqdata.state = cur_nav.state;
				if (loading == 1 || source == 'refresh') {
					this.reqdata.page = 1;
				}
				if (source.type) {
					source.type = source.type.toLowerCase();
				}
				if (source === 'add' || source.type == 'scrolltolower') {
					if (cur_nav.loadingType == 'nomore') {
						return;
					}
					cur_nav.loadingType = 'loading';
				} else {
					cur_nav.loadingType = 'more';
				}

				await this.$func.usemall.call('orderaftersale/list', this.reqdata).then(res => {
					if (res.code === 200) {
						console.log('orderaftersale res', res);
						cur_nav.loaded = true;

						if (res.code === 200) {
							if (loading == 1 || source == 'refresh') {
								cur_nav.orderList = [];
								cur_nav.hasmore = 0;
							}

							if (res.datas.length > 0) {
								let __datas = [];
								res.datas.forEach(row => {
									__datas.push(row);
								});

								cur_nav.orderList = [...cur_nav.orderList, ...__datas];

								if (res.datas.length >= this.reqdata.rows) {
									if (this.reqdata.page == 1) {
										cur_nav.hasmore = !0;
									}
									this.reqdata.page++;
									cur_nav.loadingType = 'more';
								} else {
									cur_nav.loadingType = 'nomore';
								}
							} else {
								cur_nav.loadingType = 'nomore';
							}
						}

						if (loading == 1) {
							uni.hideLoading();
						} else if (source == 'refresh') {
							uni.stopPullDownRefresh();
						}

						this.navData = cur_nav;
					}
				})
			},

			// swiper 切换
			changeTab(e) {
				if (e.target) {
					this.tabCurrentIndex = e.target.current;
				}
			},
			//顶部tab点击
			tabClick(index) {
				this.tabCurrentIndex = index;
			},
			
			// 点击跳转详情页面
			toDetail(item) {
				uni.navigateTo({
					url: `/sub-user/pages/order/aftersale/detail?id=${item._id}`
				});
			},
			
			// 当前订单商品售后类型 - 状态
			goodsAftersaleState(res) {
				if (res.aftersale && res.aftersale.sub_state) {
					return `${res.aftersale.sub_state}`
				}
				
				return `${res.aftersale.state}`;
			},
			
			// 删除订单售后
			delOrderAftersale(item) {
				uni.showModal({
					title: '提示',
					content: '删除售后',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('orderaftersale/deleted', {
								aftersale_id: item.aftersale._id,
							}).then(res => {
								if (res.code === 200) {
									this.loadData('tab_change', 1);
								}
							})
							return;
						} 
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			// 取消订单售后
			cancelOrderAftersale(item) {
				uni.showModal({
					title: '提示',
					content: '取消售后',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('orderaftersale/cancel', {
								aftersale_id: item.aftersale._id
							}).then(res => {
								if (res.code === 200) {
									this.loadData('tab_change', 1);
								}
							})
						} 
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			// 查看物流
			toexpress(item) {
				// this.$api.msg('查看物流开发中');
				uni.navigateTo({
					url: `/sub-user/pages/order/order-express?order_id=${item.order.order_id}`
				});
			},
			// 确认收货
			toReceipt(item) {
				uni.showModal({
					title: '提示',
					content: '确认收货',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('orderaftersale/received', {
								aftersale_id: item._id
							}).then(res => {
								this.$api.msg('恭喜，已收货');
								this.loadData('tab_change', 1);
							});
						} 
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},
			calcScrollLeft(idx) {
				if (!(this.tabEles && this.tabEles.length)) return;
				// 动态计算 scrollLeft
				if (this.tabEles[idx].left > this.screenWidth / 2) {
					if (idx == this.tabEles.length - 1) {
						this.scrollLeft = this.tabEles[idx].left - this.screenWidth / 2;
						return;
					}
					this.scrollLeft = this.tabEles[idx].left - this.screenWidth / 2 + this.tabEles[idx].width / 2;
				} else {
					this.scrollLeft = 0;
				}
			}
		}
	};
</script>

<style lang="scss">
	page,
	.container {
		min-height: 100%;
		background: $page-color-base;
	}

	/* 订单状态区 */
	.navbar-area {
		white-space: nowrap;
	}

	.state-area {
		padding: 0 20rpx;
		height: 6vh;
		z-index: 10;
		top: 0;
		align-items: baseline;
	}

	.nav-item {
		flex: 1;

		&.active {
			font-size: 36rpx;
			&:after {
				position: absolute;
				left: 50%;
				transform: translate(-50%);
				bottom: 0;
				width: 44px;
				height: 0;
				border-bottom: 2px solid $base-color;
			}
		}
	}

	/* 订单轮播区 */
	.swiper-area {
		height: 94vh;
	}

	/* 订单区 */
	.order-area {}


	/* 订单项 */
	.order-item {

		/* 订单商品明细区 */
		.goods-area {
			display: flex;

			image {
				width: 180rpx;
				height: 180rpx;
			}

			.right {
				padding: 0 0 0 24rpx;
				overflow: hidden;

				.attr-box {
					font-size: $font-sm + 2upx;
					color: $font-color-light;
					padding: 10rpx 12rpx;
				}
			}
		}

		/* 操作按钮 */
		.action-btn {
			width: 156rpx;
			height: inherit;
			line-height: inherit;
			margin: 0;
			margin-left: 20rpx;
			padding: 12rpx 0;
			font-size: $font-sm + 2upx;
			color: $font-color-dark;
			/* #ifdef MP-QQ || MP-ALIPAY */
			border: 1px solid;
			/* #endif */

			&:after {
				border-radius: 100px;
			}

			&.main-btn {
				background: #fff9f9;
				color: $base-color;

				&:after {
					border-color: #f7bcc8;
				}
			}
		}
	}
</style>
