<template>
	<view class="padding-sm">
		<use-navbar title="积分抽奖"></use-navbar>

		<view class="padding-lg bg-main border-radius">
			<view class="dflex-b">
				<view class="dflex" @click="toDetail">
					<image :src="member.member_headimg || '/static/images/user/default.png'"
						class="border-radius-c headimg" style="width: 88rpx; height: 88rpx;" mode="aspectFill"></image>
					<view class="margin-left-sm">
						<view class="fwbd">
							{{ member.member_nickname || appabbr || '用云' }}
						</view>
						<view class="dflex-c" style="justify-content: start;">
							<view class="line-height-1 fs-xxs">积分明细</view>
							<text class="iconfont iconjiantou-01 fs-xxs fwbd"></text>
						</view>
					</view>
				</view>
				<view class="border-radius-lg fs-xs" style="padding: 6rpx 20rpx; border: 1rpx solid #000;"
					@click="$api.toPage('/sub-user/pages/integral/lottery-record')">
					我的抽奖
				</view>
			</view>

			<view class="padding-bottom margin-lr-xl" style="padding-top: 80rpx;">
				<view v-if="(integral.usable / integral.all) * 100 > 20" class="ft-base fs-xxs" style="height: 44rpx;">
					可用积分</view>
				<view v-else class="" style="height: 44rpx;"></view>

				<use-dbl-bar ref="bar" :value="integral.usable" :max="integral.all"></use-dbl-bar>

				<view class="w-full" style="height: 20rpx;"></view>
			</view>

			<view class="stats-area padding-bottom-sm dflex-c bg-main">
				<view class="item dflex dflex-flow-c" @click="toDetail">
					<view class="dflex-c">
						<text class="fs-lg fwb dot" style="background: #ff6a6c;"></text>
						<text class="num fwbd fs-34">{{ $api.format_number(integral.usable) }}</text>
					</view>
					<text class="ft-dark fs-xxs">可用积分</text>
					<view class="vertical-line"></view>
				</view>
				<view class="item dflex dflex-flow-c" @click="toExchange">
					<view class="dflex-c">
						<text class="fs-lg fwb dot" style="background: #ffbc49;"></text>
						<text class="num fwbd fs-34">{{ $api.format_number(integral.used) }}</text>
					</view>
					<text class="ft-dark fs-xxs">已用积分</text>
					<view class="vertical-line"></view>
				</view>
				<view class="item dflex dflex-flow-c" @click="toDetail">
					<view class="dflex-c">
						<text class="fs-lg fwb"></text>
						<text class="num fwbd fs-34">{{ $api.format_number(integral.all) }}</text>
					</view>
					<text class="ft-dark fs-xxs">总积分</text>
				</view>
			</view>
		</view>

		<view class="margin-top margin-left-sm fwb">每次抽奖消耗{{prizeConfig.consume_integral || ' - '}}积分，不限次数</view>
		<view class="margin-top-sm padding-lg bg-main border-radius">
			<almost-lottery :prizeList="prizeList" :prizeIndex="prizeIndex" :colors="['#ffbc49', '#ff6a6c']"
				:strFontColors="['#fff', '#fff']" :strFontSize="24" :strMarginOutside="40" :imgWidth="66"
				:imgHeight="66" :imgMarginStr="20" @reset-index="prizeIndex = -1" @init="handleDrawInit"
				@draw-start="handleDrawStart" @draw-end="handleDrawEnd" @finish="handleDrawFinish"
				v-if="prizeList.length" />
		</view>

		<!-- #ifdef APP || MP-WEIXIN -->
		<view v-if="config && config.stimulate_integral" class="margin-top margin-left-sm fwb">任务积分</view>
		<view v-if="config && config.stimulate_integral" class="border-radius margin-top-sm" @click="toRewardedVideo">
			<use-list-title title="看视频免费领" iconfont=" " :tip="`+${config.stimulate_integral} 积分`"></use-list-title>
		</view>

		<!-- 激励视频 -->
		<!-- <ad-rewarded-video v-if="config && config.rewardedVideoAd && config.rewardedVideoAd.adpid" ref="adRewardedVideo"
			:adpid="config.rewardedVideoAd.adpid" :preload="adPreload" loadnext v-slot:default="{loading, error}"
			:url-callback="adUrlCallback" @load="onAdLoad" @close="onAdClose" @error="onAdError">
			<view class="ad-error" v-if="error">{{error}}</view>
		</ad-rewarded-video> -->
		<!-- #endif -->

		<!-- <image style="width: 100%;" mode="widthFix" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-7e00db99-ad65-4b9f-a74b-61bccb92b124/59fe46b5-7fed-4caf-82a2-b30a71874e1c.png"></image> -->

		<view class="margin-top-xl margin-bottom-sm">
			<view class="dotted-line">积分兑换</view>
		</view>
		<scroll-view scroll-x class="ws-np">
			<view class="dflex padding-bottom-sm">
				<block v-for="(item, idx) in categories" :key="idx">
					<view class="pos-r padding-tb-sm margin-right-xs padding-lr diblock line-height-1 tac"
						:class="{ active: categoryId == item._id }" @click="toSelect(item)">
						{{item.name}}
					</view>
				</block>
			</view>
		</scroll-view>
		<view class="goodsContent border-radius">
			<view class="goodsLeftList">
				<view v-if="1 == 2" class="bg-main margin-bottom-sm border-radius"
					style="height: 200rpx; background: #4645cf;">
					<image
						src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-7e00db99-ad65-4b9f-a74b-61bccb92b124/d462f254-a1a6-4225-992c-f0658f6d4e0d.jpg"
						mode="widthFix"></image>
				</view>
				<view v-for="(item, idx) in goodsLeftDatas" :key="idx"
					class="bg-main margin-bottom-sm border-radius dflex-c dflex-flow-c" @click="toGoods(item)">
					<image :src="item.img" style="max-height: 320rpx;" mode="heightFix"></image>

					<view class="padding-lr-sm margin-top-sm clamp-2">{{item.name}} {{item.name_pw}}</view>
					<view class="w-full padding-lr-sm margin-tb-sm">
						<view class="ft-base fs-xxs">
							<text class="fwb fs-lg margin-right-xs">{{ item.integral }}</text>积分
						</view>
					</view>
				</view>
			</view>
			<view class="goodsRightList">
				<view v-for="(item, idx) in goodsRightDatas" :key="idx"
					class="bg-main margin-bottom-sm border-radius dflex-c dflex-flow-c" @click="toGoods(item)">
					<image :src="item.img" style="max-height: 320rpx;" mode="heightFix"></image>

					<view class="padding-lr-sm margin-top-sm clamp-2">{{item.name}} {{item.name_pw}}</view>
					<view class="w-full padding-lr-sm margin-tb-sm">
						<view class="ft-base fs-xxs">
							<text class="fwb fs-lg margin-right-xs">{{ item.integral }}</text>积分
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" tip="无商品数据" height="66vh"></use-empty>

		<!-- 置顶 -->
		<use-totop ref="usetop"></use-totop>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	export default {
		computed: {
			...mapState(['islogin', 'member']),
			empty() {
				return this.loaded && this.goodsLeftDatas.length <= 0 && this.goodsRightDatas.length <= 0;
			},
			appabbr() {
				return this.$config.appabbr;
			}
		},
		data() {
			return {
				integral: {
					usable: 0,
					used: 0,
					all: 0
				},
				categories: [],
				categoryId: '',

				loaded: false,
				goodsLeftDatas: [],
				goodsRightDatas: [],
				// 积分配置
				config: {},
				// 抽奖状态 0未抽奖 1抽奖中
				istart: 0,
				// 奖品数据
				prizeList: [],
				// 中奖下标
				prizeIndex: -1,
				// 奖品配置
				prizeConfig: {},
				// 激励视频广告
				adLoad: false,
				adPreload: false,
				adUrlCallback: {
					userId: '',
					extra: 'lottery'
				}
			}
		},
		onPullDownRefresh() {
			this.loadData(() => {
				uni.stopPullDownRefresh();
			});
		},
		onPageScroll(e) {
			// this.scrollTop = e.scrollTop
			this.$refs.usetop.change(e.scrollTop);
		},
		onLoad() {
			this.loadData();
			this.loadGoodsData();
			this.loadLotteryData();
		},
		onShow() {},
		methods: {
			async loadData(callback) {
				this.$func.usemall.call('integral/data').then(res => {

					if (typeof callback === 'function') callback();

					if (res.code == 200) {
						this.integral.all = res.datas.member.member_integral_total || 0;
						this.integral.used = res.datas.member.member_integral_total - res.datas.member
							.member_integral_surplus || 0;
						this.integral.usable = res.datas.member.member_integral_surplus || 0;

						this.categories = [{
							_id: '',
							name: '全部'
						}, ...res.datas.categories];

						// 积分配置
						this.config = res.datas.config;

						// 是否存在激励视频 +积分配置
						if (this.config.stimulate_integral) {
							// 预载广告数据 
							if (this.$refs.adRewardedVideo) this.adPreload = true;
							// 用户ID
							this.adUrlCallback.userId = this.member._id;
						}
						return;
					}
				});
			},
			async loadGoodsData() {
				this.$db['usemall-integral-goods']
					.where({
						state: '销售中'
					})
					.whereif(this.categoryId, {
						cid: this.categoryId
					})
					.tolist({
						orderby: 'sort asc',
						page: 1,
						size: 100
					})
					.then(res => {
						if (res.code == 200) {
							this.loaded = true;
							const leftDatas = [];
							const rightDatas = [];
							res.datas.forEach((goods, idx) => {
								if (idx % 2 == 0) {
									leftDatas.push(goods);
								} else {
									rightDatas.push(goods);
								}
							});

							this.goodsLeftDatas = leftDatas;
							this.goodsRightDatas = rightDatas;
							// this.goodsDatas = res.datas;
						}
					});
			},
			loadLotteryData() {
				uni.showLoading({
					title: '请求中'
				});
				this.$func.usemall.call('marketing/lottery/data').then(res => {
					uni.hideLoading();
					if (res.code == 200) {
						console.log('lottery/config res', res);
						// 奖品配置
						this.prizeConfig = res.datas;
						const prizes = [];
						res.datas.prizes.forEach(x => {
							prizes.push({
								prizeId: x.id,
								prizeName: x.name,
								prizeImage: x.type == 1 ? '/static/images/lottery/integral.png' :
									'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-7e00db99-ad65-4b9f-a74b-61bccb92b124/bd7c12ab-9570-47c9-bca1-19dd1da5efac.gif'
							});
						})
						this.prizeList = prizes;
						return;
					}
				});
			},
			toSelect(item) {
				this.categoryId = item._id;
				this.loadGoodsData();
			},
			toDetail() {
				uni.navigateTo({
					url: '/sub-user/pages/integral/detail'
				})
			},
			toGoods(item) {
				uni.navigateTo({
					url: `/sub-user/pages/integral/goods?id=${item._id}`
				})
			},
			toExchange() {
				uni.navigateTo({
					url: '/sub-user/pages/integral/order'
				})
			},
			// 初始化
			handleDrawInit() {
				uni.showLoading({
					title: '加载中'
				});
			},
			// 本次抽奖开始
			handleDrawStart() {
				if (this.istart) {
					return;
				}
				this.istart = 1;

				// 这里需要处理你的中奖逻辑，并得出 prizeIndex
				//console.log('handleDrawStart');
				uni.showLoading({
					title: '抽奖中'
				});
				this.$func.usemall.call('marketing/lottery/draw').then(res => {
					uni.hideLoading();

					if (res.code == 200) {
						console.log('lottery/draw res', res);
						this.prizeDesc = res.datas.prize_desc;
						this.prizeIndex = res.datas.lottery_id - 1;
						return;
					}

					this.istart = 0;
					this.$api.msg(res.msg);
				});
			},
			// 本次抽奖结束
			handleDrawEnd() {
				// 完成抽奖后，这里处理你拿到结果后的逻辑
				//console.log('handleDrawEnd');
				this.istart = 0;
				if (this.prizeDesc) {
					this.$api.msg(this.prizeDesc);
				}

				// 重新加载数据
				this.loadData();
			},
			// 抽奖转盘绘制完成
			handleDrawFinish(res) {
				// 抽奖转盘准备就绪后，这里处理你的逻辑
				//console.log('handleDrawFinish', res);
				// console.log('抽奖转盘绘制完成', res)
				uni.hideLoading();
			},
			onAdLoad() {
				console.log('onAdLoad', arguments);
				this.adLoad = 1;
			},
			onAdClose(e) {
				console.log('onAdClose', arguments);
				uni.hideLoading();

				const detail = e.detail;
				// 用户点击了【关闭广告】按钮
				if (detail && detail.isEnded) {
					// 正常播放结束
					console.log("onClose ", detail.isEnded);
					
					// 重新加载数据
					this.loadData();
				} else {
					// 播放中途退出
					console.log("onClose ", detail.isEnded);
				}
			},
			onAdError() {
				console.log('onAdError', arguments);
			},
			toRewardedVideo() {
				if (this.$refs.adRewardedVideo) {
					this.$api.msg('加载中');

					if (!this.adLoad) {
						this.$refs.adRewardedVideo.load();
					}

					this.$refs.adRewardedVideo.show();
					return;
				}

				this.$api.msg('视频未成功加载，请稍后尝试');
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f5f5;
	}

	.active {
		color: #ff6a6c;
		font-weight: bold;
		font-size: 34rpx;
	}

	.goodsContent {
		width: 100%;
		display: flex;
		justify-content: center;

		.ft-dark {
			color: #585858;
		}
	}

	.goodsLeftList,
	.goodsRightList {
		width: 50%;
		overflow: hidden;
	}

	.goodsLeftList {
		margin-right: 10rpx;
	}

	.goodsRightList {
		margin-left: 10rpx;
	}

	.dot {
		width: 16rpx;
		height: 16rpx;
		border-radius: 50%;
		margin-right: 12rpx;
	}

	.vertical-line {
		height: 50%;
	}

	.image-wrapper {
		overflow: hidden;

		image {
			width: 100%;
			max-height: 300rpx;
			opacity: 1;
		}
	}

	.stats-area .item,
	.order-area .item {
		position: relative;
		flex: 1;
	}
</style>
