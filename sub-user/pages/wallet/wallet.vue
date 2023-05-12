<template>
	<view class="pos-r padding-sm">
		<use-navbar title="我的钱包"></use-navbar>
		
		<view class="border-radius bg-main padding">
			<view class="fwbd fs">我的余额</view>
			<view class="dflex-c padding-tb">
				<use-ring ref="ring" active-color="#ff696b" base-color="#ffbc49" :value="totalAmount" :max="totalAmount" @success="ringSuccess">
					<view class="dflex-c dflex-flow-c">
						<view class="price tac ft-black fs-xxl">{{totalAmount}}</view>
						<view class="fs-xs ft-dark">总余额</view>
					</view>
				</use-ring>
			</view>
			
			<view class="dflex-c w-full margin-top margin-bottom-sm" @click="cashoutPopup = true">
				<view class="tac border-radius-lg padding-tb-sm fwb" style="border: 1px solid #ff6a6c; color: #ff6a6c; background: #fef0ef; width: 70vw;">立即提现</view>
			</view>
		</view>
		
		<view class="dflex-b margin-top-sm" style="align-items: stretch;">
			
			<view class="border-radius dflex-c dflex-flow-c padding-lr-lg padding-tb bg-main margin-right-xs wpre-50" @click="to('/sub-user/pages/wallet/cashout-record')">
				<view class="fs-xxs ft-dark">待审：<text class="price">{{member.unprofit_amount / 100 || 0}}</text></view>
				
				<view class="dflex-c margin-top-xl">
					<view class="iconfont iconmingxi fs-70" style="color: #6f96f1;"></view>
					<view class="margin-left">
						<view class="fs-30 fwbd">
							提现记录
						</view>
						<view class="fs-xxs ft-dark">查看提现记录</view>
					</view>
				</view>
			</view>
			
			<view class="margin-left-xs wpre-50">
				<view class="border-radius dflex-c padding-lr-lg padding-tb bg-main" @click="to('/sub-user/pages/wallet/purchase-history')">
					<view class="iconfont iconmingxi fs-70" style="color: #ff696b;"></view>
					<view class="margin-left">
						<view class="fs-30 fwbd">
							消费记录
						</view>
						<view class="fs-xxs ft-dark">消费支出情况</view>
					</view>
				</view>
				<view class="border-radius dflex-c padding-lr-lg padding-tb bg-main margin-top-sm" @click="to('/sub-user/pages/wallet/recharge-record')">
					<view class="iconfont iconmingxi fs-70" style="color: #ffbc49;"></view>
					<view class="margin-left">
						<view class="fs-30 fwbd">
							充值记录
						</view>
						<view class="fs-xxs ft-dark">充值详细情况</view>
					</view>
				</view>
			</view>
		</view>
		
		
		<view class="border-radius bg-main padding margin-top-sm">
			<view class="fwbd fs">余额充值</view>
			
			<view class="dflex money-area">
				<view v-for="item in rechargeDatas" :key="item._id" :class="{ active: rechargeData._id == item._id }" 
					@click="rechargeChange(item)" class="item flex1 wpre-30 dflex-c dflex-flow-c">
					<view class="price">{{item.money}}</view>
					<text class="fs-xs">到账￥{{item.arrival}}</text>
				</view>
			</view>
			
			<input v-model="rechargeMoney" class="w-full padding border-radius-sm bg-drak" type="digit" placeholder="请输入其他金额" @blur="moneyBlur" />
			
			<view class="dflex-c w-full margin-tb" @click="toRecharge">
				<view class="dflex-c dflex-flow-c border-radius-lg padding-tb-sm bg-warn fwb line-height-1" style="width: 70vw;">
					<text class="">马上充值</text>
					<text class="fs-xxs margin-top-xs ft-dark-4">并同意{{agreementDatas.map(x => x.name).join('、') || '服务协议'}}</text>
				</view>
			</view>
			
			<view class="margin-top dflex-c">
				<text v-for="(item, idx) in agreementDatas" :key="idx" class="ft-base margin-left-xs fs-xs padding-tb" @click.stop="toContent(item)">{{item.name}}</text>
			</view>
		</view>
		
		<view class="safe-area-inset-bottom"></view>
		
		<!-- 立即支付 -->
		<use-pay title="余额充值" ref="upay" :money-pay="false" :money="moneyVal" :loaded="true" @pay="toPay"></use-pay>
		
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
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	export default {
		computed: {
			...mapState(['islogin', 'member', 'h5Weixin'])
		},
		data() {
			return {
				data: {},
				cashoutPopup: false,
				// 提现金额
				money: 0,
				totalAmount: 0,
				cashoutVal: 0,
				moneyVal: 50,
				isubmit: 0,
				rechargeDatas: [
					{ _id: 'U1', money: 50, arrival: 50 },
					{ _id: 'U2', money: 100, arrival: 100 },
					{ _id: 'U3', money: 500, arrival: 500 }
				],
				rechargeData: { _id: 'U1', money: 50, arrival: 50 },
				rechargeMoney: '',
				agreementDatas: []
			};
		},
		onPullDownRefresh() {
			this.loadData();
		},
		onLoad() {
			this.loadData();
			
			this.$db['usemall-sys-agreement'].where({
				type: '钱包'
			}).tolist().then(res => {
				if (res.code == 200) {
					this.agreementDatas = res.datas;
			
					this.agreementContent += this.agreementDatas.map(x => x.name).join('、');
				}
			})
		},
		methods: {
			...mapMutations(['putMember']),
			loadData() {
				this.totalAmount = (this.member.member_amount / 100) || 0;
				this.cashoutVal = this.totalAmount;
				this.$func.usemall.call('money/data').then(res => {
					uni.stopPullDownRefresh();
					if (res.code == 200) {
						if (this.member.member_amount != res.datas.member_amount || this.member.unprofit_amount != res.datas.unprofit_amount) {
							this.totalAmount = (res.datas.member_amount / 100) || 0;
							this.cashoutVal = this.totalAmount;
							// 更新用户 member_amount
							this.member.member_amount = res.datas.member_amount;
							this.member.unprofit_amount = res.datas.unprofit_amount;
							this.putMember(this.member);
						}
						
						this.$refs.ring.draw(this.cashoutVal, this.totalAmount);
					}
				});
			},
			ringSuccess() {
				// this.$api.msg('ringSuccess');
			},
			// 提现
			cashout() {
				this.money = parseFloat(this.money) || 0;
				if (!this.money || this.money <= 0) {
					this.$api.msg(`提现金额需大于0`);
					return;
				}
				
				if (this.money > this.member.member_amount / 100) {
					this.$api.msg('提现金额大于可提现金额' + this.member.member_amount / 100 + '元', 2500);
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
							
							this.$func.usemall.call('money/cashout', {
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
				
						} 
					}
				});
				
			},
			// 记录
			to(url) {
				uni.navigateTo({
					url
				});
			},
			rechargeChange(item) {
				this.rechargeData = item;
				this.moneyVal = this.rechargeData.money;
			},
			moneyBlur(e) {
				console.log('moneyBlur', e);
				if (e.detail.value) this.moneyVal = parseFloat(parseFloat(e.detail.value).toFixed(2));
			},
			toRecharge() {
				if (this.moneyVal <= 0) {
					this.$api.msg('充值金额需大于0');
					return;
				}
				
				this.$refs.upay.open();
				this.moneyShow = false;
			},
			async toContent(item) {
				const content =
					`<div class="__rich_text">${item.content.replace(/<h1/gi, '<h1 class="use-p"').replace(/<h3/gi, '<h3 class="use-p"').replace(/<p/gi, '<p class="use-p"')}</div>`;
			
				uni.setStorage({
					key: '__rich_text',
					data: content,
					success() {
						uni.navigateTo({
							url: '/pages/content/rich-text'
						})
					}
				})
			},
			// 预处理不同端支付
			prePayment(callback) {
				
				// #ifdef APP || H5
				if (typeof callback === 'function') {
					callback({ code: '' });
				}
				return;
				// #endif
				
				uni.login({
					success: (loginRes) => {
						console.log('loginRes', loginRes);
						if (loginRes.code) {
							if (typeof callback === 'function') {
								callback(loginRes);
							}
						}
					},
					fail: (err) => {
						// this.$api.msg(err);
						this.isubmit = 0;
						uni.hideLoading();
					}
				})
			},
			toPay(res) {
				if (this.moneyVal <= 0) {
					this.$api.msg('充值金额需大于0');
					return;
				}
				
				this.$refs.upay.close();
				
				if (this.isubmit) return;
				this.isubmit = 1;
				uni.showLoading({
					title: '支付中'
				});
				
				this.prePayment(pres => {
					let obj = {
						code: pres.code,
						title: '余额充值',
						money: this.moneyVal,
						...res,
						// #ifdef H5-WEIXIN
						// 当前用户openid（微信公众号）
						pay_openid: this.h5Weixin.openid,
						pay_trade_type: 'H5WX',
						// #endif
					};
					
					this.$func.usemall.call('pay/order', obj).then(res => {
						console.log('支付接口', obj, res);
						this.moneyVal = 0;
						if (res.code === 200) {
							if (res.datas) {
								let payDatas = {};
								
								// #ifdef H5-WEIXIN
								payDatas = res.datas;
								// 调用微信公众号支付
								this.h5Wxpay(payDatas, res.datas.pay_id);
								return;
								// #endif
								
								// #ifdef APP
								switch (obj.pay_way){
									case '微信支付':
										payDatas = {
											provider: 'wxpay',
											orderInfo: res.datas
										};
										break;
									case '支付宝':
										payDatas = {
											provider: 'alipay',
											orderInfo: res.datas.orderInfo
										};
										break;
								}
								// #endif
								
								//#ifdef MP-WEIXIN
								payDatas = {
									timeStamp: res.datas.timeStamp,
									nonceStr: res.datas.nonceStr,
									package: res.datas.package,
									signType: res.datas.signType,
									paySign: res.datas.paySign
								};
								//#endif
								
								// #ifdef MP-ALIPAY
								payDatas = {
									tradeNO: res.datas.trade_no
								};
								// #endif
								
								// 调用支付
								this.toPayment(payDatas, res.datas.pay_id);
							} 
							
							return;
						}
						
						this.$api.timerout(() => {
							if (typeof res.msg === 'object') {
								res.msg = res.msg.errorMessage;
							}
							this.$api.msg(res.msg, 5000);
							this.isubmit = 0;
							uni.hideLoading();
						}, 800);
					});
				});
			},
			toPayment(payDatas, pid) {
				this.rechargeMoney = '';
				this.isubmit = 0;
				uni.hideLoading();
				
				console.log('toPayment', payDatas, pid);
				
				uni.requestPayment({
					...payDatas,
					success: async (pres) => {
						console.log('requestPayment success:', pres);
						// #ifdef MP-ALIPAY
						if (pres.resultCode !== "9000") {
							this.$api.msg(pres.memo || '支付未完成，请重新支付');
							return;
						}
						// #endif
						
						// 支付成功
						uni.showLoading({
							title: '查询中'
						});
						
						if (pid) {
							this.$func.usemall.call('pay/success', { pid }).then(res => {
								uni.hideLoading();
								if (res.code == 200) {
									// 累计当前成功支付金额
									// this.user_money += payMoney * 100;
									// this.member.user_money = this.user_money;
									
									// 重新加载数据
									this.loadData();
									return;
								}
								
								this.$api.msg(res.msg);
							});
						}
						return;
					},
					fail: (err) => {
						console.log('requestPayment fail:', err);
					},
					complete: () => {
						this.moneyVal = 0;
					}
				});
			},
			// #ifdef H5-WEIXIN
			h5Wxpay(data, pid) {
				let onBridgeReady = () => {
					WeixinJSBridge.invoke(
						'getBrandWCPayRequest', 
						data,
						// {
						// 	"appId": "wx2421b1c4370e1234", 	//公众号ID，由商户传入 
						// 	"timeStamp": "1395712654", 		//时间戳，自1970年以来的秒数 
						// 	"nonceStr": "e61463f8efa94090b1f366cccfbbb444", 		//随机串 
						// 	"package": "prepay_id=u802345jgfjsdfgsdg888",
						// 	"signType": "MD5", 										//微信签名方式： 
						// 	"paySign": "70EA570631E4BB79628FBCA90534C63FF7FADD89" 	//微信签名 
						// },
						(res) => {
							this.isubmit = 0;
							this.moneyVal = 0;
							
							if (res.err_msg == "get_brand_wcpay_request:ok") {
								// 支付成功
								uni.showLoading({
									title: '查询中'
								});
								
								if (pid) {
									this.$func.usemall.call('pay/success', { pid }).then(res => {
										uni.hideLoading();
										if (res.code == 200) {
											// 累计当前成功支付金额
											// this.user_money += payMoney * 100;
											// this.member.user_money = this.user_money;
											
											// 重新加载数据
											this.loadData();
											return;
										}
										
										this.$api.msg(res.msg);
									});
								}
								return;
							}
							
							uni.hideLoading();
						}
					);
				}
			
				if (typeof WeixinJSBridge == "undefined") {
					if (document.addEventListener) {
						document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
					} else if (document.attachEvent) {
						document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
						document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
					}
				} else {
					onBridgeReady();
				}
			}
			// #endif
		},
	}
</script>

<style lang="scss">
	page {
		background: #f5f5f5;
	}
	
	.money-area {
		margin-top: 30rpx;
		margin-bottom: 20rpx;
		.item {
			height: 150rpx;
			background: #f5f5f5;
			border-radius: 14rpx;
			
			.price {color: #333; margin-bottom: 10rpx;}
			text {color: #9a9a9a;}
			
			&:nth-child(2) {
				margin-left: 20rpx;
				margin-right: 20rpx;
			}
		}
		
		.active {
			background: #ffbc49;
			color: #fff;
			
			.price, text {color:#fff !important;}
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
