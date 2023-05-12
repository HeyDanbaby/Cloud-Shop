<template>
	<view class="user-area">
		<view class="header-area padding-lr-sm" :style="{ 'padding-top': `${paddingTop}px` }">
			<view class="dflex-b">
				<view class="member-area padding-top-sm margin-bottom dflex pos-r flex1" @click="to('/sub-user/pages/setting/personal')">
					<view>
						<image class="headimg border-radius-c" :src="member.member_headimg || '/static/images/user/default.png'"></image>
					</view>
					<view class="margin-left-sm">
						<view class="info-box">
							<text v-if="islogin" class="fs-lg line-height-1">{{ member.member_nickname || config.appabbr }}</text>
							<text v-else class="fs-lg">去登录</text>
						</view>
						<view v-if="member.slogan"><text class="fs-xxs">{{ member.slogan }}</text></view>
						<view v-else-if="member.member_city"><text class="fs-xxs">{{ member.member_city }}</text></view>
					</view>
				</view>
				<view class="border-radius-big bg-base dflex-c padding-lr margin-right" @click="to('/sub-user/pages/integral/sign')">
					<view class="iconfont fs-xl iconqiandao margin-right-xs"></view>
					<view>{{ signed ? '已签到' : '签到' }}</view>
				</view>
			</view>

			<view class="border-radius">
				<view class="vip-card-area pos-r padding-lr-lg use-hover" @click="tovip">
					<view class="dflex-b">
						<view class="dflex">
							<text class="iconfont iconhuiyuan ft-base line-height-1 margin-right-xs"></text>
							<view class="animated uscroll">
								<text v-if="member.vip" class="margin-left-xs">每日福利不断！</text>
								<text v-else class="margin-left-xs">会员立享5大权益！</text>
							</view>
				
						</view>
						<view class="">
							<text v-if="member.vip" style="color: #b65b5d;border: 1px solid #b65b5d;"
								class="fs-xs border-radius-lg padding-tb-xs padding-lr-sm">会员中心</text>
							<text v-else style="color: #b65b5d;border: 1px solid #b65b5d;"
								class="fs-xs border-radius-lg padding-tb-xs padding-lr-sm">立即开通</text>
						</view>
					</view>
				</view>

				<view class="stats-area dflex-c bg-main">
					<view class="item dflex dflex-flow-c" @click="to('/sub-user/pages/wallet/wallet')">
						<text class="num">{{ $api.format_number(member.member_amount / 100) || 0 }}</text>
						<text>我的余额</text>
						<view class="vertical-line"></view>
					</view>
					<view class="item dflex dflex-flow-c" @click="to('/sub-user/pages/integral/integral')">
						<text class="num">{{ $api.format_number(member.member_integral) || 0 }}</text>
						<text>我的积分</text>
						<view class="vertical-line"></view>
					</view>
					<view class="item dflex dflex-flow-c" @click="to('/sub-user/pages/coupon/coupon')">
						<text class="num">{{ member.member_coupon_cnt || 0 }}</text>
						<text>优惠券</text>
					</view>
				</view>
			</view>
		</view>

		<view class="container-area padding-lr-sm padding-bottom-sm">
			<!-- 我的订单 -->
			<view class="border-radius margin-top-sm bg-main">
				<use-list-title title="我的订单" iconfont="icondingdan" color="#ff6a6c" fwt="600" tip="查看全部订单"
					@goto="toOrder('/sub-user/pages/order/order', '全部')"></use-list-title>

				<view class="order-area padding-bottom-sm padding-lr dflex-c">
					<view class="item dflex dflex-flow-c" @click="toOrder('/sub-user/pages/order/order', '待付款')">
						<view class="iconfont">&#xe6da;<view class="badge badge-small"
								v-if="stats && stats.order_state && stats.order_state['待付款'] > 0">
								{{stats.order_state['待付款']}}
							</view>
						</view>
						<text>待付款</text>
					</view>
					<view class="item dflex dflex-flow-c" @click="toOrder('/sub-user/pages/order/order', '待成团')">
						<view class="iconfont">&#xe6d9;<view class="badge badge-small"
								v-if="stats && stats.order_state && stats.order_state['待成团'] > 0">
								{{stats.order_state['待成团']}}
							</view>
						</view>
						<text>待成团</text>
					</view>
					<view class="item dflex dflex-flow-c" @click="toOrder('/sub-user/pages/order/order', '待发货')">
						<view class="iconfont">&#xe6d7;<view class="badge badge-small"
								v-if="stats && stats.order_state && stats.order_state['待发货'] > 0">
								{{stats.order_state['待发货']}}
							</view>
						</view>
						<text>待发货</text>
					</view>
					<view class="item dflex dflex-flow-c" @click="toOrder('/sub-user/pages/order/order', '待收货')">
						<view class="iconfont">&#xe622;<view class="badge badge-small"
								v-if="stats && stats.order_state && stats.order_state['待收货'] > 0">
								{{stats.order_state['待收货']}}
							</view>
						</view>
						<text>待收货</text>
					</view>
					<view class="item dflex dflex-flow-c" @click="toOrder('/sub-user/pages/order/order', '待评价')">
						<view class="iconfont">&#xe6db;<view class="badge badge-small"
								v-if="stats && stats.order_state && stats.order_state['待评价'] > 0">
								{{stats.order_state['待评价']}}
							</view>
						</view>
						<text>待评价</text>
					</view>
					<!-- <view class="item dflex dflex-flow-c" @click="toOrder('/sub-user/pages/order/order', '售后中')">
						<view class="iconfont">&#xe715;<view class="badge badge-small"
								v-if="stats && stats.order_state && stats.order_state['售后中'] > 0">
								{{stats.order_state['售后中']}}
							</view>
						</view>
						<text>售后/退款</text>
					</view> -->
				</view>
			</view>
			
			<view v-if="showh5Weixin" class="border-radius margin-top-sm bg-main">
				<!-- 未关注公众号的情况下显示 -->
				<use-list-title title="关注公众号" iconfont="iconweixin" color="#58bc8a" fwt="600" tip="关注领积分"
					@goto="to('/sub-user/pages/setting/setting')"></use-list-title>
			</view>
			
			<view class="border-radius margin-top-sm bg-main">
				<!-- 我的足迹 -->
				<use-list-title title="我的足迹" iconfont="iconzuji" color="#ffab6c" fwt="600" :tip="stats.browsing"
					@goto="to('/sub-user/pages/browsing/browsing')"></use-list-title>
				<scroll-view scroll-x class="browsing-area padding-lr">
					<view class="dflex">
						<view v-for="(item, index) in historyDatas" :key="index" class="pos-r">
							<view v-if="item.tag" class="use-tag pos-a pos-top bg-base" style="z-index: 9;">{{item.tag}}</view>
							<image class="border-radius-sm margin-right-sm" @click="togoods(item)" :src="item.img"
								mode="aspectFill"></image>
						</view>
					</view>
				</scroll-view>
				
				<use-list-title title="退款/售后" iconfont="iconmianxing-05" color="#ff7043" fwt="600" :tip="stats.aftersale"
					@goto="to('/sub-user/pages/order/aftersale/list')"></use-list-title>
					
				<use-list-title title="我的收藏" iconfont="iconshoucang-" color="#ff6a6c" fwt="600" :tip="stats.collect"
					@goto="to('/sub-user/pages/collect/collect')"></use-list-title>
				<use-list-title title="我的钱包" iconfont="iconqianbao-01" color="#9776ff" fwt="600" tip="充值、余额、提现"
					@goto="to('/sub-user/pages/wallet/wallet')"></use-list-title>
				<use-list-title title="分销中心" iconfont="iconfenxiaozhongxin-01" color="#ff756e" fwt="600" tip="分享赚钱"
					@goto="to('/sub-user/pages/distribution/distribution')"></use-list-title>
				<use-list-title title="收货人" iconfont="icondizhi-" color="#5a9ded" fwt="600"
					@goto="to('/sub-user/pages/address/address')"></use-list-title>
				<use-list-title title="常见问题" iconfont="iconchangjianwenti-01" color="#ffab6c" fwt="600"
					@goto="to('/sub-user/pages/setting/faq')"></use-list-title>
				<use-list-title title="设置" iconfont="iconshezhi-" color="#58bc8a" fwt="600"
					@goto="to('/sub-user/pages/setting/setting')"></use-list-title>
			</view>

			<view v-if="islogin" class="border-radius margin-top-sm padding-sm dflex-c bg-main log-out-btn"
				@click="openActionSheet">
				<text class="cell-tit">退出登录</text>
			</view>
			<view v-else class="border-radius margin-top-sm padding-sm dflex-c bg-main log-out-btn"
				@click="to('/pages/login/login')">
				<text class="cell-tit">去登录</text>
			</view>

			<!-- 操作菜单 -->
			<use-action-sheet v-model="actionSheetShow" :list="actionSheetList" :tips="actionSheetTips"
				@click="actionSheetClick" @close="actionSheetClose"></use-action-sheet>
		</view>

		<!-- 用云版权 -->
		<use-copyright></use-copyright>
	</view>
</template>
<script>
	const db = uniCloud.database();
	
	import { mapState, mapMutations } from 'vuex';
	export default {
		computed: {
			...mapState(['islogin', 'member']),
			paddingTop() {
				return this.$api.navbar.top + 6;
			},
			config() {
				return this.$config;
			},
			showh5Weixin() {
				return false;
				
				if (this.member && this.member.member_weixin && this.member.member_weixin.h5) return false;
				return true;
			}
		},
		data() {
			return {
				isreq: false,
				// 浏览历史
				historyDatas: [],
				// 统计数据
				stats: {},

				actionSheetShow: false,
				actionSheetList: [],
				actionSheetTips: {
					text: "",
					color: "#9a9a9a",
					size: 24
				},

				signed: false,
			};
		},
		onLoad() {
		},
		onShow() {
			if (!this.islogin) {
				this.stats = {};
				this.historyDatas = [];
				this.logout();
				
				// this.$api.msg('账号未登录');
				return;
			}

			this.loadData();
		},
		methods: {
			...mapMutations(['logout', 'putMember']),
			// 加载数据
			loadData() {
				uni.getStorage({
					key: this.$config.const.__sign_time,
					success: (res) => {
						this.signed = res.data == this.$api.format(new Date(), 'yyyy-MM-dd');
					}
				})
				this.$func.usemall.call('member/data').then(res => {
					if (res.code == 200) {
						if (this.member && this.member.is_plus === '付费会员' && this.member.plus_time >= Date.now()) {
							res.datas.member.vip = true;
						}
						this.putMember(res.datas.member);
						console.log('member/data', res);
						
						this.stats = res.datas.stats;
						this.stats.order_state = {};
						this.stats.order.forEach(_order => {
							this.stats.order_state[_order._id] = _order.num;
						});
					}
				});

				// 浏览历史
				// 更改为临时表方式
				const goodsTemp = db.collection('usemall-goods').getTemp();
				
				db.collection('usemall-goods-history', goodsTemp)
					.where('create_uid == $env.uid')
					.field('visit_cnt, param, last_modify_time, goods._id as goods_id, goods.img as goods_img, goods.state as goods_state')
					.orderBy('last_modify_time desc') 
					.get()
					.then(res => {
						if (res && res.result && res.result.errCode === 0) {
							let _historyDatas = [];
							let _typeObj = {
								group: '拼团',
								seckill: '秒杀'
							};
							
							res.result.data.forEach(x => {
								x._id = x.goods_id[0];
								x.img = x.goods_img[0];
								x.state = x.goods_state[0];
								
								if (x.param && x.param.__type) {
									x.tag = _typeObj[x.param.__type];
								}
								
								_historyDatas.push(x);
							});
							this.historyDatas = _historyDatas;
							
							console.log('this.historyDatas', this.historyDatas);
						}
					});
			},

			// 打开操作菜单
			openActionSheet() {
				this.actionSheetShow = true;

				this.$api.timerout(() => {
					this.actionSheetList = [{
						text: "退出登录",
						color: "#333"
					}, {
						text: "切换账号",
						color: "#333"
					}, ];

				}, 0);
			},
			// 关闭操作菜单
			actionSheetClose() {
				console.log(this.actionSheetShow);
			},
			// 点击操作菜单
			actionSheetClick(index) {
				switch (index) {
					case 0:
						this.$api.msg('退出成功');
						
						this.stats = {};
						this.historyDatas = [];
						
						this.logout();
						break;
					case 1:
						this.$api.tologin();
						break;
				}
			},

			updateMember() {
				return;
				if (this.isreq) return;
				this.isreq = true;
				
				uni.getUserProfile({
					desc: '更新会员信息',
					lang: 'zh_CN',
					success: (res) => {
						this.$func.usemall.call('member/update', {
							nickname: res.userInfo.nickName,
							gender: res.userInfo.gender,
							avatar: res.userInfo.avatarUrl,
							comment: [res.userInfo.country, res.userInfo.province, res.userInfo.city].filter(x => x).join('-')
						}).then(res => {
							this.isreq = false;
							
							if (res.code == 200) {
								this.loadData();
								return;
							}

							this.$api.msg(res.msg);
						})
					},
					fail: (err) => {
						console.log(err);
						this.isreq = false;
					}
				});
			},

			// 统一跳转接口，拦截未登录路由
			to(url) {
				if (!this.islogin) {
					this.$api.tologin()
					return;
				}

				uni.navigateTo({
					url
				});
			},
			// 跳转到 订单
			toOrder(url, state) {
				if (!this.islogin) {
					this.$api.tologin()
					return;
				}

				uni.setStorage({
					key: '__order_state',
					data: state,
					success(res) {
						console.log(res);
					},
					complete() {
						uni.navigateTo({
							url
						});
					}
				});
			},

			// 跳转商品详情
			togoods(item) {
				item.param = item.param || {};
				this.$api.togoods({
					id: item._id,
					
					...item.param
				});
			},
			tovip() {
				// console.log('share_mid', uni.getStorageSync('__use_share_mid'))
				// this.$api.msg('share_mid ' + uni.getStorageSync('__use_share_mid'));
				
				if (this.member.vip) {
					uni.navigateTo({
						url: `/sub-user/pages/member/member`
					});
					return;
				}
				
				uni.navigateTo({
					url: `/sub-user/pages/member/member-not`
				});
			}
		}
	};
</script>
<style lang="scss">
	page {
		min-height: 100%;
		background: $page-color-base;
	}

	.member-area {
		image {
			width: 130rpx;
			height: 130rpx;
			border: 5rpx solid #fff;
		}
	}

	.vip-card-area {
		padding-top: 12rpx;
		padding-bottom: 12rpx;
		font-size: 24rpx;
		color: #c6b181;
		background-color: #000000;
		/* 不支持线性的时候显示 */
		background-image: linear-gradient(to right, #3a3a3a, #000000);
		
		.iconfont{font-size: 66rpx;}
	}

	.stats-area {
		.item {
			padding: 30rpx 0;
		}

		.num {
			font-size: $font-lg;
			color: $font-color-dark;
			margin-bottom: 6rpx;
		}
	}

	.order-area {
		.item {}

		.iconfont {
			position: relative;
			font-size: $font-lg + 8upx;

			.badge {
				right: initial;
			}
		}
	}

	.stats-area .item,
	.order-area .item {
		position: relative;
		font-size: $font-sm;
		color: $font-color-base;
		flex: 1;
	}

	.browsing-area {
		image {
			width: 160rpx;
			height: 160rpx;
		}
	}

	::-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
		display: none;
	}

	.log-out-btn {
		color: $font-color-base;
	}
</style>
