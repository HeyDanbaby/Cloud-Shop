<template>
	<view class="app w-full">
		<use-navbar title="支付中心"></use-navbar>

		<view class="price-box dflex-c dflex-flow-c">
			<view v-if="time_remaining" class="dflex-c" style="height: 60rpx;">
				<text class="fs-xs">剩余</text>
				<use-count-down 
					separator-color="#333" 
					color="#333" 
					bg-color="rgba(0, 0, 0, 0)"
					font-size="26" 
					:timestamp="time_remaining" 
					@end="onExpire"></use-count-down>
			</view>
			<view v-else class="w-full" style="height: 60rpx;"></view>
			
			<view>支付金额</view>
			<view class="price fs-xxxl margin-top-sm">{{money}}</view>
		</view>

		
		<view class="pay-type-list">
			
			<!-- #ifdef MP-ALIPAY || APP -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('支付宝')">
				<text class="iconfont iconalipay"></text>
				<view class="item flex1">
					<text class="tit">支付宝支付</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="" color="#FF6A6C" :checked="pay_way == '支付宝'" :disabled="!!isubmit || money <= 0" />
					</radio>
				</label>
			</view>
			<!-- #endif -->
			
			<!-- #ifdef MP-WEIXIN || APP -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('微信支付')">
				<text class="iconfont iconweixin"></text>
				<view class="item flex1">
					<text class="tit">微信支付</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="" color="#FF6A6C" :checked="pay_way == '微信支付'" :disabled="!!isubmit || money <= 0" /></radio>
				</label>
			</view>
			<!-- #endif -->

			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('钱包支付')">
				<text class="iconfont iconqianbao-01 ft-base"></text>
				<view class="item flex1">
					<text class="tit">钱包支付</text>
					<text v-if="userMoney < money" class="ft-base-1" @click="toWallet">余额不足<text class="" style="margin-left: 16rpx;">去充值</text></text>
					<text v-else>￥{{userMoney}}</text>
				</view>
				<label class="radio">
					<radio value="" color="#FF6A6C" :checked="pay_way == '钱包支付'" :disabled="!!isubmit || userMoney < money" /></radio>
				</label>
			</view>
			
			<!-- #ifdef MP-BAIDU -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('百度钱包')">
				<text class="iconfont iconbaidu"></text>
				<view class="item flex1">
					<text class="tit">百度钱包</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="" color="#FF6A6C" :checked="pay_way == '百度钱包'" :disabled="!!isubmit || money <= 0" />
					</radio>
				</label>
			</view>
			<!-- #endif -->

			<!-- #ifdef MP-QQ -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('QQ钱包')">
				<text class="iconfont iconqq"></text>
				<view class="item flex1">
					<text class="tit">QQ钱包</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="" color="#FF6A6C" :checked="pay_way == 'QQ钱包'" :disabled="!!isubmit || money <= 0" />
					</radio>
				</label>
			</view>
			<!-- #endif -->

			<!-- #ifdef MP-TOUTIAO -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('头条支付', '微信支付', 'MWEB')">
				<text class="iconfont icontoutiao"></text>
				<view class="item flex1">
					<text class="tit">收银台</text>
					<text>推荐使用</text>
				</view>
				<label class="radio">
					<radio value="wxpay" color="#ff6a6c" colors="#ff6a6c"
						:checked="pay_way == '头条支付' && pay_trade_type == 'MWEB'" :disabled="!!isubmit || money <= 0" />
					</radio>
				</label>
			</view>
			<!-- #endif -->

			<!-- #ifdef H5 || MP-360 -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('微信支付', '微信支付', 'MWEB')">
				<text class="iconfont iconweixin"></text>
				<view class="item flex1">
					<text class="tit">微信支付</text>
					<text>推荐使用，拉起微信支付</text>
				</view>
				<label class="radio">
					<radio value="wxpay" color="#ff6a6c" colors="#ff6a6c"
						:checked="pay_way == '微信支付' && pay_trade_type == 'MWEB'" :disabled="!!isubmit || money <= 0" />
					</radio>
				</label>
			</view>

			<!-- #ifndef H5-WEIXIN -->
			<view class="type-item dflex-b pos-r padding-tb-sm" @click="changePayType('微信支付', '微信支付', 'NATIVE')">
				<text class="iconfont iconweixin"></text>
				<view class="item flex1">
					<text class="tit">微信支付</text>
					<text>扫一扫 微信支付二维码</text>
				</view>
				<label class="radio">
					<radio value="wxpay" color="#ff6a6c" colors="#ff6a6c"
						:checked="pay_way == '微信支付' && pay_trade_type == 'NATIVE'" :disabled="!!isubmit || money <= 0" />
					</radio>
				</label>
			</view>
			<view class="qrcode tac padding-tb">
				<use-qrcode :onval="true" :val="qrcode" qrsize="200" @result="qrcodeResult"></use-qrcode>
			</view>
			<!-- #endif -->

			<!-- #endif -->
		</view>

		<view class="padding w-full dflex-c margin-top-big pos-a safe-area-inset-bottom" style="bottom: 30rpx;">
			<view class="dflex-b border-radius-big" style="min-width: 66vw;">
				<!-- #ifndef H5 || MP-360 -->
				<view class="dflex-c padding-tb-sm flex1 padding-lr" 
					:class="isubmit ? 'bg-disabled' : 'bg-base'" @click="confirm">
					<view v-if="isubmit == 1" class="use-loading"></view>
					<text v-else>{{pay_tip}}</text>
				</view>
				<!-- #endif -->

				<!-- #ifdef H5 || MP-360 -->
				<view class="dflex-c padding-tb-sm flex1 padding-lr" 
					:class="isubmit ? 'bg-disabled' : 'bg-base'" @click="check">
					<view v-if="isubmit == 1" class="use-loading"></view>
					<text v-else>{{pay_tip}}</text>
				</view>
				<!-- #endif -->
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	export default {
		data() {
			return {
				order_id: '',
				order_state: '',
				money: 0,
				isubmit: 1,
				// 平台支付方式
				pay_way: '微信支付',
				// 原始支付方式 微信支付 支付宝支付
				pay_original: '',
				// JSAPI，NATIVE，APP，H5支付固定传 MWEB
				pay_trade_type: '',
				pay_tip: '确认支付',

				qrcode: '',
				time_remaining: 0,
				userMoney: 0
			};
		},
		computed: {
			...mapState(['islogin', 'member', 'h5Weixin']),
		},
		onLoad(options) {
			if (options.p == 'h5') {
				// #ifdef H5
				this.h5PayCallback();
				// #endif
			}

			this.money = options.money / 100 || 0;
			this.order_id = options.order_id;


			// #ifdef MP-ALIPAY || APP
			this.pay_way = '支付宝';
			this.pay_original = '支付宝支付';
			this.pay_trade_type = '';
			// #ifdef APP
			this.pay_trade_type = 'APP';
			// #endif
			// #endif
			
			// #ifdef MP-WEIXIN || APP
			this.pay_way = '微信支付';
			this.pay_original = '微信支付';
			this.pay_trade_type = 'JSAPI';
			// #ifdef APP
			this.pay_trade_type = 'APP';
			// #endif
			// #endif
			
			// #ifdef MP-BAIDU 
			this.pay_way = '百度钱包';
			// #endif
			// #ifdef MP-QQ
			this.pay_way = 'QQ钱包';
			// #endif
			// #ifdef MP-TOUTIAO
			this.$api.timerout(() => {
				this.pay_way = '头条支付';
				this.pay_original = '微信支付';
				this.pay_trade_type = 'MWEB';
			}, 0)
			// #endif


			// #ifdef H5 || MP-360
			this.pay_tip = '已完成支付';
			this.$api.timerout(() => {
				this.pay_way = '微信支付';
				this.pay_original = '微信支付';
				this.pay_trade_type = 'NATIVE';
				// #ifdef H5
				this.pay_trade_type = 'MWEB';
				this.pay_tip = '确认支付';
				// #endif
			}, 0)
			// #endif

			this.loadData();
		},

		methods: {
			...mapMutations(['putMember']),
			qrcodeResult(res) {},
			loadData() {
				this.$func.usemall.call('order/detail', {
					order_id: this.order_id
				}).then(res => {
					console.log('order/detail res', res);
					if (res.code == 200) {
						this.isubmit = 0;
						this.order_state = res.datas.order.order_pay_state;
						if (res.datas.order.state !== '待付款') {
							this.pay_tip = this.order_id + ' 订单' + res.datas.order.state;
							this.isubmit = 2;
						} else {
							this.time_remaining = (res.datas.order.order_expire_time - Date.now()) / 1000;	
						}

						this.money = res.datas.order.order_actural_paid / 100;
						if (this.money <= 0) {
							uni.redirectTo({
								url: `/sub-goods/pages/pay/success?order_id=${this.order_id}`
							});
							return;
							// this.pay_way = '微信支付';
						}

						// #ifdef H5 || MP-360
						// 获取微信支付二维码
						this.loadQRCode();
						// #endif
						return;
					}
					this.$api.msg(res.msg);
				});
				
				this.userMoney = (this.member.member_amount / 100) || 0;
				this.$func.usemall.call('money/data').then(res => {
					if (res.code == 200) {
						if (this.member.member_amount != res.datas.member_amount) {
							this.userMoney = (res.datas.member_amount / 100) || 0;
							// 更新用户 member_amount
							this.member.member_amount = res.datas.member_amount;
							this.putMember(this.member);
						}
					}
				});
			},

			//选择支付方式
			changePayType(type, original, trade_type) {
				if (this.isubmit) return;
				if (this.money <= 0) return;
				if (type === '钱包支付' && this.userMoney < this.money) return;
				
				// #ifdef APP
				this.pay_trade_type = 'APP';
				// #endif
				
				this.pay_way = type;
				if (original) this.pay_original = original;
				if (trade_type) this.pay_trade_type = trade_type;

				if (this.pay_trade_type == 'MWEB') {
					this.pay_tip = '确认支付';
				} else if (this.pay_trade_type == 'NATIVE') {
					this.loadQRCode();
				}
			},
			toWallet() {
				uni.navigateTo({
					url: '/sub-user/pages/wallet/wallet'
				})
			},
			//确认支付
			confirm() {
				
				if (this.isubmit == 2) {
					uni.redirectTo({
						url: `/sub-user/pages/order/order-detail?order_id=${this.order_id}`
					});
					return;
				}
				
				if (this.isubmit) return;
				this.isubmit = 1;
				
				if (this.pay_way == '钱包支付') {
					uni.showModal({
						title: '提示',
						content: '钱包支付',
						success: (opt) => {
							if (opt.confirm) {
								uni.showLoading({
									title: '支付中'
								});
								this.$func.usemall.call('money/pay', { order_id: this.order_id })
									.then(res => {
										uni.hideLoading();
										if (res.code == 200) {
										this.isubmit = 0;
											uni.redirectTo({
												url: `/sub-goods/pages/pay/success?order_id=${this.order_id}`
											});
											return;
										}
										
										this.$api.msg(res.msg);
									});
								return;
							}
							
							this.isubmit = 0;
						}
					});
					return;
				}

				this.prePayment((preRes) => {
					let obj = {
						code: preRes.code,
						order_id: this.order_id,
						pay_way: this.pay_way,
						pay_original: this.pay_original,
						pay_trade_type: this.pay_trade_type,
						// #ifdef H5-WEIXIN
						// 当前用户openid（微信公众号）
						pay_openid: this.h5Weixin.openid,
						pay_trade_type: 'H5WX',
						// #endif
					};
					this.$func.usemall.call('order/pay', obj).then(res => {
						console.log('支付接口', obj, res);

						if (res.code === 200) {
							if (res.datas) {
								let pay_datas = {};

								// #ifdef H5-WEIXIN
								pay_datas = res.datas;
								// 调用微信公众号支付
								this.h5Wxpay(pay_datas);
								return;
								// #endif

								// #ifdef H5
								let cur_url = location.href;
								if (cur_url.indexOf('&p=h5') == -1) {
									cur_url += '&p=h5';
								}
								const redirect_url = encodeURIComponent(`${cur_url}`);
								location.href = `${res.datas.mwebUrl}&redirect_url=${redirect_url}`;
								return;
								// #endif

								// #ifdef APP
								switch (obj.pay_way){
									case '微信支付':
										pay_datas = {
											provider: 'wxpay',
											orderInfo: res.datas
										};
										break;
									case '支付宝':
										pay_datas = {
											provider: 'alipay',
											orderInfo: res.datas.orderInfo
										};
										break;
								}
								delete pay_datas.orderInfo.order_id;
								// #endif

								//#ifdef MP-WEIXIN
								pay_datas = {
									timeStamp: res.datas.timeStamp,
									nonceStr: res.datas.nonceStr,
									package: res.datas.package,
									signType: res.datas.signType,
									paySign: res.datas.paySign
								};
								//#endif

								// #ifdef MP-ALIPAY
								pay_datas = {
									tradeNO: res.datas.trade_no
								};
								// #endif

								//#ifdef MP-BAIDU
								pay_datas = {
									orderInfo: res.datas.pay
								};
								//#endif

								//#ifdef MP-QQ
								pay_datas = {
									bargainor_id: res.datas.pay.bargainor_id,
									package: res.datas.pay.package
								};
								//#endif

								// #ifdef MP-TOUTIAO
								pay_datas = {
									orderInfo: res.datas.pay,
									service: 1,
									payChannel: {
										// wx || alipay
										default_pay_channel: "wx",
									},
									getOrderStatus: function(res) {
										let {
											out_order_no
										} = res;
										console.log('toutiao getOrderStatus out_order_no',
											out_order_no);

										return new Promise(function(resolve, reject) {
											// 商户前端根据 out_order_no 请求商户后端查询微信支付订单状态
											this.$func.usemall.call(
												"order/paystate", {
													order_id: out_order_no
												}).then(res => {
												// 商户后端查询的微信支付状态，通知收银台支付结果
												/*
												  0：支付成功
												  1：支付超时
												  2：支付失败
												  3：支付关闭
												  9：订单状态未知/未支付
												*/
												if (res.code == 200) {
													let code = 9;
													let trade_state = res
														.datas
														.trade_state || "";

													if (res.datas
														.pay_state == '已付款'
													) {
														code = 0
													} else if (
														trade_state ==
														'SUCCESS') {
														code = 0;
													} else if (
														trade_state ==
														'NOTPAY' ||
														trade_state ==
														'PAYERROR') {
														code = 2;
													} else if (
														trade_state ==
														'CLOSED') {
														code = 3;
													}
													resolve({
														code: code
													});
													return;
												}
												resolve({
													code: 9
												});
											}).catch(err => {
												reject(err);
											});
										});
									}
								};
								// #endif

								// 调用支付
								this.toPayment(pay_datas, res.datas.order_id);
							} else {
								uni.setStorage({
									key: '__order_state',
									data: '待付款',
									success: (res) => {
										console.log(res);
									},
									complete: () => {
										this.$api.toorder();
									}
								});
							}

							return;
						}

						this.$api.timerout(() => {
							if (typeof res.msg === 'object') {
								res.msg = res.msg.errorMessage;
							}
							this.$api.msg(res.msg, 5000);
							this.isubmit = 0;
						}, 800);
					});
				});
			},
			// 预处理不同端支付
			prePayment(callback) {

				// #ifdef APP || H5
				if (typeof callback === 'function') {
					callback({
						code: ''
					});
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
						this.$api.msg(err);
						this.isubmit = 0;
					}
				})
			},
			toPayment(pay_datas, order_id) {

				uni.requestPayment({
					...pay_datas,
					success: (pres) => {
						console.log('requestPayment success:', pres);
						// #ifdef MP-TOUTIAO
						if (pres.code !== 0) {
							switch (pres.code) {
								case 1:
									this.$api.msg('支付超时，请重新支付');
									break;
								case 2:
									this.$api.msg('已取消，请重新支付');
									break;
								case 3:
									this.$api.msg('支付关闭，请重新支付');
									break;
								case 4:
									this.$api.msg('支付取消，请重新支付');
									break;
								case 9:
								default:
									this.$api.msg('支付失败，请重新支付');
									break;
							}
							return;
						}
						// #endif
						// #ifdef MP-ALIPAY
						if (pres.resultCode !== "9000") {
							this.$api.msg(pres.memo || '支付未完成，请重新支付');

							uni.setStorage({
								key: '__order_state',
								data: '待付款',
								success: (res) => {
									console.log(res);
								},
								complete: () => {
									this.$api.toorder();
								}
							});
							return;
						}
						// #endif

						uni.redirectTo({
							url: `/sub-goods/pages/pay/success?order_id=${this.order_id}`
						});
						return;
					},
					fail: (err) => {
						console.log('requestPayment fail:', err);

						uni.setStorage({
							key: '__order_state',
							data: '待付款',
							success: (res) => {
								console.log(res);
							},
							complete: () => {
								this.$api.toorder();
							}
						});
					},
					complete: () => {
						this.isubmit = 0;
					}
				});
			},
			onExpire() {
				this.$api.alert('订单已取消', () => {
					// 跳转进入订单详情页
					uni.redirectTo({
						url: `/sub-user/pages/order/order-detail?order_id=${this.order_id}`
					});
				});
			},
			// 检测订单支付状态
			check() {
				if (this.pay_trade_type == 'MWEB') {
					this.confirm();
					return;
				}

				this.$func.usemall.call("order/paystate", {
					order_id: this.order_id
				}).then(res => {
					// 商户后端查询的微信支付状态，通知收银台支付结果
					/*
					  0：支付成功
					  1：支付超时
					  2：支付失败
					  3：支付关闭
					  9：订单状态未知/未支付
					*/
					if (res.code == 200) {
						let code = 9;
						let trade_state = res.datas.trade_state || "";

						if (res.datas.pay_state == '已付款') {
							code = 0
						} else if (trade_state == 'SUCCESS') {
							code = 0;
						} else if (trade_state == 'NOTPAY' || trade_state == 'PAYERROR') {
							code = 2;
						} else if (trade_state == 'CLOSED') {
							code = 3;
						}

						switch (code) {
							case 0:
								uni.redirectTo({
									url: `/sub-goods/pages/pay/success?order_id=${this.order_id}`
								});
								break;
							case 1:
								this.$api.msg('支付超时，请重新支付', 3500);
								break;
							case 2:
								this.$api.msg('已取消，请重新支付', 3500);
								break;
							case 3:
								this.$api.msg('支付关闭，请重新支付', 3500);
								break;
							case 4:
								this.$api.msg('支付取消，请重新支付', 3500);
								break;
							case 9:
							default:
								this.$api.msg('支付失败，请重新支付', 3500);
								break;
						}
						return;
					}

					this.$api.msg(res.msg);
				}).catch(err => {

				});
			},
			// #ifdef H5 || MP-360
			loadQRCode() {
				if (this.pay_trade_type == 'MWEB') return;
				
				// 改变按钮提示文字
				this.pay_tip = '已完成支付';
				
				let obj = {
					order_id: this.order_id,
					pay_way: this.pay_way,
					pay_original: this.pay_original,
					pay_trade_type: this.pay_trade_type,
				};
				uni.showLoading({
					title: '请求中'
				})
				// this.$api.alert('二维码支付开发中');
				this.$func.usemall.call('order/pay', obj).then(res => {
					console.log('支付接口', obj);
					uni.hideLoading();

					if (res.code === 200) {
						if (res.datas) {
							this.qrcode = res.datas.codeUrl;
							this.time_remaining = res.datas.time_remaining;
						} else {
							uni.setStorage({
								key: '__order_state',
								data: '待付款',
								success: (res) => {
									console.log(res);
								},
								complete: () => {
									this.$api.toorder();
								}
							});
						}

						return;
					}

					this.$api.timerout(() => {
						this.$api.msg(res.msg, 5000);
						this.isubmit = 0;
					}, 800);
				});
			},
			h5PayCallback() {
				uni.showModal({
					title: '支付提醒',
					content: '微信支付是否已完成',
					confirmColor: '#ff6a6c',
					confirmText: '已完成支付',
					cancelText: '重新支付',
					success: (res) => {
						if (res.confirm) {
							if (this.order_state == '已付款') {
								uni.redirectTo({
									url: `/sub-goods/pages/pay/success?order_id=${this.order_id}`
								});
								return;
							}

							uni.setStorage({
								key: '__order_state',
								data: '全部',
								success: (res) => {
									console.log(res);
								},
								complete: () => {
									this.$api.toorder();
								}
							});
							return;
						}
					}
				});
			},
			// #ifdef H5-WEIXIN
			h5Wxpay(data) {
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
							if (res.err_msg == "get_brand_wcpay_request:ok") {
								// 支付成功
								uni.redirectTo({
									url: `/sub-goods/pages/pay/success?order_id=${this.order_id}`
								});
								return;
							}
							
							this.isubmit = 0;
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

			// #endif
		}
	}
</script>

<style lang='scss'>
	.app {}

	.price-box {
		height: 400rpx;
		font-size: 28rpx;
		color: #909399;
	}

	.pay-type-list {
		padding-left: 60rpx;
		padding-right: 60rpx;

		.type-item {
			height: 120rpx;
			font-size: 30rpx;
		}

		.iconfont {
			width: 100rpx;
			font-size: 52rpx;
		}

		.iconhuiyuan {
			color: #fe8e2e;
		}

		.iconweixin {
			color: #36cb59;
		}

		.iconalipay {
			color: #01aaef;
		}

		.iconqq {
			color: #13c6fe;
		}

		.iconbaidu {
			color: #306cff;
		}

		.icontoutiao {
			color: #f85959;
		}

		.tit {
			font-size: $font-lg;
			color: $font-color-dark;
			margin-bottom: 4rpx;
		}

		.item {
			display: flex;
			flex-direction: column;
			font-size: $font-sm;
			color: $font-color-light;
		}
	}
</style>
