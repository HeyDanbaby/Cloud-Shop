<template>
	<view class="container">
		<use-navbar title="我的订单"></use-navbar>
		
		<!-- #ifdef MP-ALIPAY -->
		<!-- 订单状态区 -->
		<view class="pos-f w-full state-area dflex navbar-area">
			<view class="nav-item dflex-c pos-r fs h-full" :class="{ active: tabCurrentIndex === index }"
				v-for="(item, index) in navList" :key="index" @click="tabClick(index)">
				{{ item.state }}
			</view>
		</view>

		<!-- 订单轮播区 -->
		<view class="order-area w-full" style="margin-top: 7vh;">
			<!-- 空白页 -->
			<use-empty v-if="navData.orderList.length === 0 && navData.loaded" e-style="round" e-type="cart"
				tip="订单数据为空" height="93vh"></use-empty>
			<!-- 订单列表区 -->
			<view class="padding-lr margin-bottom-sm" :class="index === 0 ? 'padding-top-sm' : ''"
				v-for="(item, index) in navData.orderList" :key="index">
				<!-- 订单项 -->
				<view class="order-item padding bg-main border-radius">
					<view @click="toDetail(item.order)">
						<!-- 订单商品明细 -->
						<view class="goods-area" :class="{ 'margin-top': goodsIndex > 0 }"
							v-for="(goodsItem, goodsIndex) in item.order_detail" :key="goodsIndex">
							<image :src="goodsItem.goods_img" mode="aspectFill"></image>
							<view class="right flex1">
								<text class="clamp-2">{{ goodsItem.goods_name }} {{ goodsItem.goods_name_pw }}</text>
								<view class="ft-dark fs-xs padding-top-xs">
									<text class="margin-right-sm">× {{goodsItem.goods_num}}</text>
									{{ goodsItem.goods_sku_name || '&nbsp;&nbsp;' }}
								</view>
								<view class="margin-top-sm dflex-b">
									<text class="price ft-main fs-sm">{{ goodsItem.goods_price / 100 }}</text>
									
									<button v-if="!item.order.order_refund_state && ['待收货', '待评价', '已完成'].includes(item.order.state)" 
										class="action-btn border-radius-big bg-main" @click="choiceAftersale(item.order, goodsItem)">申请售后</button>
								</view>
							</view>
						</view>

						<!-- 实付款 -->
						<view class="dflex-e">
							<text class="fs-xs margin-right-xs">实付款</text>
							<text class="price ft-main">{{ item.order.order_actural_paid / 100 }}</text>
						</view>
					</view>

					<!-- 订单操作区 -->
					<view class="dflex-b margin-top-sm">
						<view>
							<!-- 当前状态 -->
							<text class="ft-dark" v-if="item.order.order_refund_state == '处理中'">退款处理中</text>
							<text class="ft-dark" v-else-if="item.order.order_refund_state">{{ item.order.order_refund_state }}</text>
							<text class="ft-dark" v-else-if="item.order.state == '待评价'">已发货</text>
							<text class="ft-dark" v-else>{{ item.order.state }}</text>
						</view>

						<view class="dflex-e">
							<view class="dflex" v-if="item.order.state == '待付款'">
								<button class="action-btn border-radius-big bg-main"
									@click="cancelOrder(item)">取消订单</button>

								<button v-if="item.order.order_pay_state == '待付款'"
									class="action-btn border-radius-big bg-main main-btn"
									@click="toPayment(item.order)">立即支付</button>
								<button v-if="item.order.order_pay_state == '待核实'"
									class="action-btn border-radius-big bg-main main-btn"
									@click="toPayment(item.order)">待核实</button>
							</view>
							<view class="dflex" v-if="item.order.state == '待发货'">
								<button v-if="!item.order.order_refund_state"
									class="action-btn border-radius-big bg-main" @click="toRefund(item)">申请退款</button>
							</view>
							<button v-if="!item.order.order_refund_state && 
										['待收货', '待评价', '已完成'].includes(item.order.state)" 
								class="action-btn border-radius-big bg-main" @click="toExpress(item)">查看物流</button>
							<view class="dflex" v-if="item.order.state == '待收货'">
								<button v-if="!item.order.order_refund_state"
									class="action-btn border-radius-big bg-main main-btn"
									@click="toReceipt(item)">确认收货</button>
							</view>
							<view class="dflex" v-if="item.order.state == '待评价'">
								<button class="action-btn border-radius-big bg-main main-btn"
									@click="toEvaluate(item)">我要评价</button>
							</view>
							<view class="dflex" v-if="['已取消', '已完成'].includes(item.order.state)">
								<button class="action-btn border-radius-big bg-main main-btn"
									@click="delOrder(item)">删除订单</button>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 上拉加载更多 -->
			<use-loadmore v-if="navData.orderList.length > 0 && navData.loaded && navData.hasmore"
				:type="navData.loadingType"></use-loadmore>

		</view>
		<!-- #endif -->

		<!-- #ifndef MP-ALIPAY -->
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
							<view @click="toDetail(item.order)">
								<!-- 订单商品明细 -->
								<view class="goods-area pos-r" :class="{ 'margin-top': goodsIndex > 0 }"
									v-for="(goodsItem, goodsIndex) in item.order_detail" :key="goodsIndex">
									<image :src="goodsItem.goods_sku_img || goodsItem.goods_img" class="border-radius" mode="aspectFill"></image>
									<view class="right flex1">
										<text class="clamp-2">{{ goodsItem.goods_name }}
											{{ goodsItem.goods_name_pw }}</text>
										<view class="ft-dark fs-xs padding-top-xs">
											<text class="margin-right-sm">× {{goodsItem.goods_num}}</text>
											{{ goodsItem.goods_sku_name || '&nbsp;&nbsp;' }}
										</view>
										<view class="margin-top-sm dflex-b">
											<text class="price ft-main fs-sm">{{ (goodsItem.goods_amount || goodsItem.goods_price) / 100}}</text>
											
											<!-- 商品售后 -->
											<button v-if="canAftersale(item.order, goodsItem)" class="action-btn border-radius-big bg-main" 
												@click.stop="choiceAftersale(item.order, goodsItem)">申请售后</button>
											<text v-else-if="goodsAftersaleState(item.order, goodsItem)" 
												@click.stop="toAftersaleDetail(goodsItem.aftersale_id)"
												:class="{ 'ft-base': goodsItem.aftersale_state === 1, 'ft-dark': goodsItem.aftersale_state === 2 }">{{goodsAftersaleState(item.order, goodsItem)}}</text>
										</view>
									</view>
									
									<view v-if="goodsItem.goods_price_tag" class="use-tag pos-a pos-top bg-base margin-right-sm">{{goodsItem.goods_price_tag}}</view>
									<view v-else-if="goodsItem.is_vip === '是'" class="use-tag pos-a pos-top bg-base margin-right-sm">会员价</view>
								</view>

								<!-- 实付款 -->
								<view class="dflex-e margin-top-sm">
									<text class="fs-xs margin-right-xs">实付款</text>
									<text class="price ft-main">{{ item.order.order_actural_paid / 100}}</text>
								</view>
							</view>

							<!-- 订单操作区 -->
							<view class="dflex-b margin-top">
								<view>
									<!-- 当前状态 -->
									<text v-if="[1, 2].includes(item.order.aftersale_state)" class="ft-dark">{{ orderAftersaleState(item.order) }}</text>
									<text v-else-if="item.order.state == '待评价'" class="ft-dark">已收货</text>
									<view v-else-if="item.order.state == '待成团' && item.order.timestamp">
										<use-count-down
											fontSize="24"
											separatorSize="24"
											color="#fff"
											bgColor="#3c3c3c"
											:showDays="true"
											separatorColor="#3c3c3c"
											separatorSpace="8"
											:timestamp="item.order.timestamp"
											@end="removeData(item)"
										></use-count-down>
									</view>
									<text v-else class="ft-dark">{{ item.order.state }}</text>
								</view>
								
								<view class="dflex-e">
									<view v-if="item.order.state == '待付款'" class="dflex">
										<button v-if="item.order.order_pay_state == '待核实'"
											class="action-btn border-radius-big bg-main main-btn"
											@click="toPayment(item.order)">待核实</button>
										<button v-else class="action-btn border-radius-big bg-main"
											@click="cancelOrder(item)">取消订单</button>

										<button v-if="item.order.order_pay_state == '待付款'"
											class="action-btn border-radius-big bg-main main-btn"
											@click="toPayment(item.order)">立即支付</button>
										
									</view>
									<view v-if="item.order.state == '待成团' && !item.order.order_refund_state" class="dflex">
										<!-- <button class="action-btn border-radius-big bg-main"
											@click="cancelOrder(item)">取消拼单</button> -->
										<button class="action-btn border-radius-big main-btn" open-type="share" :data-id="item.order._id"
											@click="toGroupShare(item)">邀请好友</button>
									</view>
									<view v-if="item.order.state == '待发货'" class="dflex">
										<button v-if="!item.order.order_refund_state"
											class="action-btn border-radius-big bg-main"
											@click="toRefund(item)">申请退款</button>
									</view>
									<!-- 查看整单售后 -->
									<view v-if="[1, 2].includes(item.order.aftersale_state) && item.order.order_sku_cnt === 1" class="dflex">
										<button class="action-btn border-radius-big bg-main"
											@click="toAftersaleDetail(item.order.aftersale_id)">售后详情</button>
									</view>
									
									<button v-if="!item.order.order_refund_state && 
										item.order.aftersale_state !== 2 && 
										['待收货', '待评价', '已完成'].includes(item.order.state)" 
										class="action-btn border-radius-big bg-main" 
										@click="toExpress(item)">查看物流</button>
									<view v-if="item.order.state == '待收货'" class="dflex">
										<button v-if="!item.order.order_refund_state"
											class="action-btn border-radius-big bg-main main-btn"
											@click="toReceipt(item)">确认收货</button>
									</view>
									<view v-if="item.order.state == '待评价'" class="dflex">
										<button class="action-btn border-radius-big bg-main main-btn"
											@click="toEvaluate(item)">我要评价</button>
									</view>
									<view v-if="['已取消', '已完成'].includes(item.order.state)" class="dflex">
										<button class="action-btn border-radius-big bg-main main-btn" @click="delOrder(item)">删除订单</button>
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
		<!-- #endif -->
		
		<use-popup v-model="afterSaleTypeShow" bgclass=" " mode="bottom">
			<view class="padding bg-main border-radius-top30" style="max-height: 65vh;">
				<view class="dflex-c padding-lr padding-tb-sm">请选择售后类型</view>
				<view v-for="(item, idx) in afterSaleTypeDatas" :key="idx" 
					:class="{ 'border-line': idx < afterSaleTypeDatas.length - 1 }" 
					class="padding-lr padding-tb-sm" 
					@click="toAfterSale(item)">
					<view class="fwbd fs">{{item.type}}</view>
					<view class="ft-dark fs-xs">{{item.desc}}</view>
				</view>
				<view class="w-full safe-area-inset-bottom" style="height: 60rpx;"></view>
			</view>
		</use-popup>
		
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
						state: '待付款',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 2,
						state: '待成团',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 3,
						state: '待发货',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 4,
						state: '待收货',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 5,
						state: '待评价',
						loadingType: 'more',
						orderList: []
					},
					{
						id: 6,
						state: '已完成',
						loadingType: 'more',
						orderList: []
					}
				],
				reqdata: {
					page: 1,
					rows: 10
				},
				scrollLeft: 0,
				title: '全部',
				curData: {},
				screenWidth: 0,
				afterSaleTypeShow: false,
				afterSaleTypeDatas: [
					{ id: 1, type: '我要退款', desc: '未收到货，需要申请退款' },
					{ id: 2, type: '我要退货', desc: '已收到货，需要退货并退款' },
					{ id: 3, type: '我要换货', desc: '对货物不满意，申请换货' }
				]
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
			
			uni.hideLoading();
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
			...mapState(['islogin', 'member']),
		},
		methods: {
			// 获取订单列表
			loadData(source = 'add', loading) {
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

				this.$func.usemall.call('order/list', this.reqdata).then(res => {
					console.log('order/list res', res);
					if (res.code === 200) {
						cur_nav.loaded = true;

						if (res.code === 200) {
							if (loading == 1 || source == 'refresh') {
								cur_nav.orderList = [];
								cur_nav.hasmore = 0;
							}

							if (res.datas.length > 0) {
								let __datas = [];
								res.datas.forEach(row => {
									if (row.order.state == '待成团') {
										row.order.timestamp = (row.order.order_expire_time - Date.now()) / 1000;
									}
									
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

			// 当前订单售后类型 - 状态
			orderAftersaleState(order) {
				if (order.order_aftersale && order.order_aftersale.type) {
					return `${order.order_aftersale.type}`
				}
				
				if (order.order_refund_state) {
					return `退款 - ${order.order_refund_state}`;
				}
				
				return order.state;
			},
			// 当前订单商品售后类型 - 状态
			goodsAftersaleState(order, goods) {
				if (goods.aftersale && goods.aftersale.state) {
					return `${goods.aftersale.type} - ${goods.aftersale.state}`
				}
				
				if (order.order_aftersale === 99) {
					return '已超售后时间';
				}
				
				return '';
			},
			// 是否可售后
			canAftersale(order, goods) {
				// 订单状态
				if (!['待收货', '待评价', '已完成', '售后中'].includes(order.state)) { return false; }
				
				// 订单详情商品售后状态
				if (![0, 99].includes(goods.aftersale_state)) { return false; }
				
				return true;
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
			// 查看售后
			toAftersaleDetail(id) {
				if (!id) {
					this.$api.msg('售后ID不存在');
					return;
				}
				
				uni.navigateTo({
					url: `/sub-user/pages/order/aftersale/detail?id=${id}`
				});
			},
			// 点击跳转详情页面
			toDetail(order) {
				uni.navigateTo({
					url: `/sub-user/pages/order/order-detail?order_id=${order.order_id}`
				});
			},
			// 立即支付
			toPayment(order) {
				if (order.order_pay_state == '待核实') {
					this.$api.msg('订单已支付待核实状态');
					return;
				}

				this.$api.topay({
					order_id: order.order_id,
					money: order.order_actural_paid
				});
			},
			// 时间到期
			removeData(item) {
				item.order.timestamp = 0;
			},
			// 删除订单
			delOrder(item) {
				uni.showModal({
					title: '提示',
					content: '删除订单',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('order/deleted', {
								order_id: item.order.order_id,
							}).then(res => {
								if (res.code === 200) {
									this.loadData('tab_change', 1);
									return;
								}
								
								this.$api.msg(res.msg);
							})
							return;
						} 
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			// 取消订单
			cancelOrder(item) {
				uni.showModal({
					title: '提示',
					content: '取消订单',
					success: (res) => {
						
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('order/cancel', {
								order_id: item.order.order_id,
								state: '已取消'
							}).then(res => {
								if (res.code === 200) {
									this.loadData('tab_change', 1);
									return;
								}
								
								this.$api.msg(res.msg);
							})
						} 
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			// 查看物流
			toExpress(item) {
				// this.$api.msg('查看物流开发中');
				uni.navigateTo({
					url: `/sub-user/pages/order/order-express?order_id=${item.order.order_id}`
				});
			},
			// 已发货
			toReceipt(item) {
				uni.showModal({
					title: '提示',
					content: '确认收货',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('order/received', {
								order_id: item.order.order_id,
								state: '待评价'
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
			// 选择售后类型
			choiceAftersale(order, goods) {
				if (order.aftersale_state == 99) {
					this.$api.msg('当前订单已超过售后时间');
					return;
				}
				
				this.afterSaleTypeDatas = [];
				
				// 退款
				if (['待发货', '待收货'].includes(order.state)) {
					this.afterSaleTypeDatas.push({ id: 1, type: '我要退款', desc: '未收到货，需要申请退款' });
				} 
				// 退货
				if (['待收货', '待评价', '已完成'].includes(order.state)) {
					this.afterSaleTypeDatas.push({ id: 2, type: '我要退货', desc: '已收到货，需要退货并退款' });
				}
				// 换货
				if (['待评价', '已完成'].includes(order.state)) {
					this.afterSaleTypeDatas.push({ id: 3, type: '我要换货', desc: '对货物不满意，申请换货' });
				}
				
				this.afterSaleTypeShow = true;
				this.curData = {
					order,
					goods
				};
			},
			// 申请退款
			toRefund(data) {
				uni.navigateTo({
					url: `/sub-user/pages/order/aftersale/apply?type=1&order_id=${data.order.order_id}`
				});
			},
			// 申请售后
			toAfterSale(res) {
				this.afterSaleTypeShow = false;
				
				uni.navigateTo({
					url: `/sub-user/pages/order/aftersale/apply?type=${res.id}&order_id=${this.curData.order.order_id}&goods_id=${this.curData.goods.goods_id}&goods_sku_id=${this.curData.goods.goods_sku_id}`
				});
			},
			// 评价
			toEvaluate(item) {
				uni.navigateTo({
					url: `/sub-user/pages/order/order-evaluate?id=${item.order.order_id}`
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
			},
			toGroupShare(res) {
				if (!res.order.group_id) return;
				
				// #ifdef MP-WEIXIN
				uni.showLoading({
					title: '打开分享中'
				});
				// #endif
				
				let url = '';
				const group_chief_id = res.order.group_chief_id || `${res.order.create_uid}_${res.order.order_id}`;
				
				// #ifdef H5
				url = `${location.protocol}//${location.host}/#/sub-marketing/pages/group-join?id=${group_chief_id}&mid=${this.member._id}`;
				uni.setClipboardData({
					data: url,
					success: (res) => {
						uni.getClipboardData({
							success: (res) => {
								uni.showToast({
									title: '分享链接已复制'
								});
							}
						});
					}
				});
				// #endif
			}
		},
		onShareAppMessage: function(ops) {
			console.log('onShareAppMessage', ops, this.navData);
			let mid = 0;
			if (this.member && this.member._id) {
				mid = this.member._id;
			}
			
			let image = '';
			let title = this.$config.appname || '用云电商';
			let path = `/pages/tabbar/home?mid=${mid}`;
			
			if (ops.target && ops.target.dataset.id) {
				const data = this.navData.orderList.find(x => x.order._id == ops.target.dataset.id);
				
				if (data.order.state == '待成团') {
					const group_chief_id = data.order.group_chief_id || `${data.order.create_uid}_${data.order.order_id}`;
					
					title = '我正在拼单，邀请您一起参与';
					path = `/sub-marketing/pages/group-join?id=${group_chief_id}&mid=${mid}`;
				}
			}
			
			console.log('onShare path', path);
			
			return {
				title: title,
				path: path,
				imageUrl: image,
				success: function(res) {
					// 转发成功
					console.log('转发成功', res);
				},
				fail: function(res) {
					// 转发失败
					console.log('转发失败', res);
				}
			};
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
			font-size: 38rpx;
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
