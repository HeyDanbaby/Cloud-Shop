<template>
	<view class="h-full pos-r">
		<use-navbar title="分销中心" bgColor="#ff6a6c"></use-navbar>
		
		<view class="dflex-c padding-lr bg-base">
			<view class="dflex margin-tb-xl">
				<use-ring class="margin-right-xl" ref="ring" :value="cashoutVal" :max="totalAmount"
					@success="ringSuccess">
					<view class="price ft-white tac">{{cashoutVal}}</view>
					<view class="fs-xxs">待提佣金</view>
				</use-ring>

				<view class="tac margin-left-xl">
					<text class="price ft-white fs-xxxl">{{cashoutVal}}</text>
					<view class="cashout ft-base" @click="cashoutPopup = true">
						提现
					</view>
				</view>
			</view>
		</view>
		<view class="bg-main data-area padding-lr-sm padding-top">
			<view class="dflex-a w-full padding-top-xl" @click="record">
				<view class="stats dflex-c dflex-flow-c">
					<text class="price fs-xl">{{ $api.format_float(data.fxs_total_amount) || 0 }}</text>
					<view class="ft-main fs-xs">
						累计佣金
					</view>

					<view class="vertical-line"></view>
				</view>
				<view class="stats dflex-c dflex-flow-c" @click="cashoutRecordAudit">
					<text class="price fs-xl">{{ $api.format_float(data.fxs_unprofit_amount / 100) || 0 }}</text>
					<view class="ft-main fs-xs">
						待审提现
					</view>

					<view class="vertical-line"></view>
				</view>
				<view class="stats dflex-c dflex-flow-c" @click="cashoutRecordSucceed">
					<text class="price fs-xl">{{ $api.format_float(data.fxs_profit_amount / 100) || 0 }}</text>
					<view class="ft-main fs-xs">
						已提佣金
					</view>
				</view>
			</view>
			<view class="margin-tb-xl padding-top-sm padding-lr">
				<view class="tac dflex-a w-full">
					<view class="border-radius nav" @click="cashoutRecord">
						<view class="dflex-c dflex-flow-c">
							<view class="border-radius item" style="background: #ffbc49;">
								<text class="iconfont iconmingxi"></text>
							</view>
							<view class="">
								<view class="fs-30 fwbd">
									提现明细
								</view>
								<view class="ft-dark fs-xxs">
									佣金提现明细
								</view>
							</view>
						</view>
					</view>
					<view class="border-radius nav" @click="order">
						<view class="dflex-c dflex-flow-c">
							<view class="border-radius item" style="background: #6f96f1;">
								<text class="iconfont iconfenxiaodingdan-01"></text>
							</view>
							<view class="">
								<view class="fs-30 fwbd">
									分销订单
								</view>
								<view class="ft-dark fs-xxs">
									{{data.fxs_order_cnt || 0}}个订单
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="tac margin-top dflex-a w-full">
					<view class="border-radius nav" @click="fsxMember">
						<view class="dflex-c dflex-flow-c">
							<view class="border-radius item" style="background: #af69e3;">
								<text class="iconfont iconfenxiaohuiyuan-01"></text>
							</view>
							<view class="">
								<view class="fs-30 fwbd">
									分销成员
								</view>
								<view class="ft-dark fs-xxs">
									{{data.fxs_member_cnt || 0}}个会员
								</view>
							</view>
						</view>
					</view>
					<view class="border-radius nav" @click="pending">
						<view class="dflex-c dflex-flow-c">
							<view class="border-radius item" style="background: #f8815b;">
								<text class="iconfont icondaishenyongjin-01"></text>
							</view>
							<view class="">
								<view class="fs-30 fwbd">
									待结佣金
								</view>
								<view class="ft-dark fs-xxs">
									共{{ $api.format_float(data.fxs_unsettled_amount / 100) || 0}}元
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="tac margin-top dflex-a w-full padding-bottom-xl">
					<view class="border-radius nav" @click="poster">
						<view class="dflex-c dflex-flow-c">
							<view class="border-radius item" style="background: #5a9ded;">
								<text class="iconfont iconhaibao"></text>
							</view>
							<view class="">
								<view class="fs-30 fwbd">
									我的海报
								</view>
								<view class="ft-dark fs-xxs">
									分享专属海报
								</view>
							</view>
						</view>
					</view>
					<view class="border-radius nav" @click="faq">
						<view class="dflex-c dflex-flow-c">
							<view class="border-radius item" style="background: #ffab6c;">
								<text class="iconfont iconchangjianwenti-01"></text>
							</view>
							<view class="">
								<view class="fs-30 fwbd">
									常见问题
								</view>
								<view class="ft-dark fs-xxs">
									疑问小帮手
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<use-popup v-model="cashoutPopup" bgclass=" " mode="center" borderRadius="20">
			<!-- 提现弹出框 -->
			<view class="padding-lr-xl cashout-area">
				<view class="margin-bottom-sm ft-dark fs-xxs">提现手续费 1%</view>
				<view class="dflex border-radius-sm field">
					<text class="margin-right-xs">￥</text><input type="digit" class="w-full" v-model="money" placeholder="输入提现金额" />
				</view>
				<view class="dflex-b ft-dark margin-top-sm fs-xxs">
					<view>提现到</view>
					<view>微信零钱</view>
				</view>
				<view class="bg-base margin-top-xl tac w-full border-radius-lg padding-tb-sm" @click.stop="cashout">
					立即提现
				</view>
			</view>
		</use-popup>
		
		<use-popup mode="bottom" bgclass=" " v-model="posterShow" @close="">
			<view class="padding border-radius margin">
				<view v-if="!posterUrl" class="tac bg-main padding border-radius pos-a pos-l-c" style="bottom: 45vh">
					海报生成中，请稍等</view>
				<view class="w-full" style="height: 70vh">
					<image :src="posterUrl" class="wh-full" mode="aspectFit"></image>
				</view>
		
				<view class="padding padding-bottom-xs w-full">
					<view class="dflex-b border-radius-big">
						<!-- #ifdef MP || APP -->
						<view class="tac padding-tb-sm flex1 bg-base use-hover" @click="posterSave">保存到相册</view>
						<!-- #endif -->
						<!-- #ifdef H5 || MP-360 -->
						<view class="tac padding-tb-sm flex1 bg-base">长按图片保存到相册</view>
						<!-- #endif -->
					</view>
				</view>
				
				<view class="dflex-c" @click.stop="posterShow = false">
					<view class="iconfont iconguanbi fs-xxxl ft-white"></view>
				</view>
			</view>
		</use-popup>
		
		<!-- 海报二维码 -->
		<view class="qrcode tac padding-tb pos-f pos-tl-c">
			<use-qrcode :onval="true" :val="posterQRcode" :show="false" loading-text="生成海报中" qrsize="200"
				@result="posterQRcodeResult"></use-qrcode>
		</view>
		
		<!-- 海报 -->
		<view v-if="posterShow && !posterUrl" class="poster pos-f pos-tl-c padding">
			<l-painter custom-style="position: fixed;z-index: -1;top: -200vh;left: -100vw;width: 750rpx; height: 1114rpx" :board="posterData"
				isH5PathToBase64 isRenderImage @success="posterSuccess" />
		</view>
	</view>
</template>

<script>
	
	import lPainter from '@/uni_modules/lime-painter/components/lime-painter/';
	import uposter from '@/common/poster.js';
	
	import {
		mapState
	} from 'vuex';
	
	export default {
		components: {
			lPainter
		},
		computed: {
			...mapState(['member'])
		},
		data() {
			return {
				data: {},
				cashoutPopup: false,
				// 提现金额
				money: '',
				totalAmount: 0,
				cashoutVal: 0,
				posterShow: false,
				posterUrl: '',
				posterQRcode: '',
				posterData: {}
			};
		},
		onLoad: function() {
			this.loadData();
		},
		methods: {
			loadData() {

				this.$func.usemall.call('fxs/data').then(res => {
					if (res.code == 200) {
						this.data = res.datas.data[0];
						
						// 累计佣金 = 已提现佣金 + 待结算佣金 + 可提现佣金 + 待审核提现佣金
						this.data.fxs_total_amount = this.$api.format_float( (this.data.fxs_profit_amount + this.data
							.fxs_unsettled_amount + this.data.fxs_cashout_amount + this.data
							.fxs_unprofit_amount) / 100 );
						this.totalAmount = this.data.fxs_total_amount;
						
						// 可提现佣金
						this.cashoutVal = this.$api.format_float(this.data.fxs_cashout_amount / 100);
						this.$refs.ring.draw(this.cashoutVal, this.totalAmount);
						// console.log('data', this.data)
					}
				});
			},
			ringSuccess() {
				// this.$api.msg('ringSuccess');
			},
			// 提现
			cashout() {
				this.money = parseFloat(this.money) || 0;
				// 判断文本框是否为空
				if (!this.money || this.money <= 0) {
					this.$api.msg(`提现金额需大于0`);
					return;
				}

				if (this.money > this.data.fxs_cashout_amount / 100) {
					this.$api.msg('提现金额大于可提现金额' + this.data.fxs_cashout_amount / 100 + '元', 2500);
					return;
				}
				
				uni.showModal({
					title: '提示',
					content: '立即提现',
					success: (opt) => {
						if (opt.confirm) {
							const cashout_amount = parseFloat(this.money).toFixed(2) * 100;

							uni.showLoading({
								title: '提交中'
							});
							
							this.$func.usemall.call('fxs/cashout', {
								cashout_amount: cashout_amount,
								cashout_way: '微信零钱',
								cashout_way_id: 0
							}).then(res => {
								
								uni.hideLoading();
								
								if (res.code == 200) {
									this.money = '';
									this.$api.msg('提交成功');
									
									this.loadData();
									this.cashoutPopup = false;
									return;
								}
								
								this.$api.msg(res.msg);
							});

						} else if (opt.cancel) {
							console.log('用户点击取消');
						}
					}
				});
				
			},
			// 分销记录
			record() {
				uni.navigateTo({
					url: `/sub-user/pages/distribution/record`
				})
			},
			// 分销成员
			fsxMember() {
				uni.navigateTo({
					url: `/sub-user/pages/distribution/member`
				})
			},
			// 待审提现
			cashoutRecordAudit() {
				uni.navigateTo({
					url: `/sub-user/pages/distribution/cashout-record?state=待审核`
				})
			},
			// 已提佣金
			cashoutRecordSucceed() {
				uni.navigateTo({
					url: `/sub-user/pages/distribution/cashout-record?state=已提现`
				})
			},
			// 提现记录
			cashoutRecord() {
				uni.navigateTo({
					url: `/sub-user/pages/distribution/cashout-record`
				})
			},
			// 分销订单
			order() {
				uni.navigateTo({
					url: `/sub-user/pages/distribution/order`
				})
			},
			// 待结佣金
			pending() {
				uni.navigateTo({
					url: `/sub-user/pages/distribution/pending`
				})
			},
			// 专属海报
			poster() {
				this.posterShow = true;
				this.createPoster();
			},
			// 常见问题
			faq() {
				uni.navigateTo({
					url: `/sub-user/pages/setting/faq?type=分销`
				})
			},
			
			// 创建海报
			createPoster() {
				if (this.posterUrl) {
					this.posterShow = true;
					return;
				}
				uni.showLoading({
					title: '生成海报中'
				});
			
				// #ifdef MP || APP
				// 此处的二维码内容，需自己在小程序端配置普通二维码规则
				this.posterQRcode = `https://usemall.use-cloud.com/wxmp/fxs_${this.member._id}`;
				// #endif
			
				// #ifdef H5
				// 如果为 h5，二维码内容需配置为线上版本产品详情路径
				this.posterQRcode =
					`https://usemall-h5.use-cloud.com?mid=${this.member._id}`;
				// #endif
			},
			// 海报二维码生成成功
			posterQRcodeResult(res) {
				// 获取产品海报数据
				this.posterData = uposter.getFxsData(this.member, res, this.$config);
				console.log('this.posterData', this.posterData);
			
				this.posterShow = true;
			},
			// 海报生成完成
			posterSuccess(res) {
				this.posterUrl = res;
			
				uni.hideLoading();
			},
			// 保存海报
			posterSave() {
				if (this.posterUrl) {
					uni.showLoading({
						title: '保存中'
					})
			
					uni.saveImageToPhotosAlbum({
						filePath: this.posterUrl,
						success: function() {
							uni.hideLoading();
			
							uni.showToast({
								title: '海报保存成功',
								icon: 'success',
								duration: 2000
							});
						}
					});
				}
			}
		},
	}
</script>

<style lang="scss">
	page {
		width: 100%;
		height: 100%;
		background-color: #ff6a6c;
	}

	.data-area {
		border-top-left-radius: 80rpx;
		border-top-right-radius: 80rpx;
		overflow: hidden;
		top: 300rpx;
		height: calc(100% - 298rpx);
		overflow-y: auto;

		.stats {
			width: 33.33%;
			position: relative;
		}

		.nav {
			width: 44%;
			box-shadow: 0 2rpx 30rpx 5rpx #f5f5f5;
			padding: 50rpx 0 30rpx;
		}

		.item {
			width: 100rpx;
			height: 100rpx;
			line-height: 100rpx;
			margin-bottom: 20rpx;

			.iconfont {
				color: #fff;
				font-size: 50rpx;
			}
		}
	}

	.cashout {
		padding: 15rpx 60rpx;
		background-color: #fff;
		border-radius: 15rpx;
	}

	.cashout-area {
		width: 80vw;
		padding: 80rpx;

		.field {
			padding: 20rpx;
			background-color: #f5f5f5;

			input {
				height: 56rpx;
				line-height: 56rpx;
			}
		}
	}
</style>
