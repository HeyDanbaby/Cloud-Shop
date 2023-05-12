<template>
	<view v-if="isload" class="order-detail">
		<use-navbar title="售后详情"></use-navbar>
		
		<!-- 售后状态 -->
		<view class="state-area padding-lr margin-tb-sm">
			<view class="padding border-radius bg-base">

				<view v-if="aftersale.state == '待处理'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">已申请{{aftersale.type}}</text>
					</view>
					<view class="dflex-c">请耐心等待工作人员处理</view>
				</view>
				
				<view v-if="aftersale.sub_state === '待寄回'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">商家已同意</text>
					</view>
					<view class="dflex-c">请寄回{{aftersale.type}}的商品</view>
				</view>
				<view v-if="aftersale.sub_state === '待收货'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">{{aftersale.type}}商品已寄回</text>
					</view>
					<view class="dflex-c">请耐心等待工作人员收货</view>
				</view>
				<view v-if="aftersale.sub_state === '待签收'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">{{aftersale.type}}商品已发货</text>
					</view>
					<view class="dflex-c">请注意查收您的快递并确认收货</view>
				</view>
				
				<view v-if="['已完成', '已取消'].includes(aftersale.state)">
					<view class="dflex-c fs-lg">
						<text class="iconfont iconyiwancheng- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">{{aftersale.state}}</text>
					</view>
					<view class="dflex-c">感谢您的支持</view>
				</view>
				
				<view v-if="['已拒绝'].includes(aftersale.state)">
					<view class="dflex-c fs-lg">
						<text class="iconfont iconyiwancheng- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">{{aftersale.state}}</text>
					</view>
					<view class="dflex-c">可重新申请售后</view>
				</view>
			</view>
		</view>
		
		<!-- 售后商品明细 -->
		<view class="address-area padding-lr margin-tb-sm">
			<view class="dflex padding-top-xs margin-bottom-xs margin-left-sm">
				<view class="ft-dark">{{aftersale.type}}商品</view>
			</view>
			<view class="padding bg-main border-radius">
				<view v-for="(item, idx) in order_detail" :key="idx" class="goods-area" 
					:class="{ 'margin-top': idx > 0 }"
					@click="toGoodsDetail(item)">
					<view class="dflex pos-r">
						<view class="img">
							<image :src="item.goods_sku_img || item.goods_img" class="border-radius"></image>
						</view>
						<view class="margin-left-sm">
							<text class="clamp-2">{{ item.goods_name }} {{ item.goods_name_pw }}</text>
							<view class="ft-dark fs-xs padding-top-xs">
								<text class="margin-right">× {{item.goods_num}}</text>
								{{ item.goods_sku_name || '&nbsp;&nbsp;' }}
							</view>
							<view class="margin-top-sm dflex-b">
								<text class="price">{{ item.goods_price / 100 }}</text>
							</view>
						</view>
						
						<view v-if="item.goods_price_tag" class="use-tag pos-a pos-top bg-base margin-right-sm">{{item.goods_price_tag}}</view>
						<view v-else-if="item.is_vip === '是'" class="use-tag pos-a pos-top bg-base margin-right-sm">会员价</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 寄回地址 -->
		<view v-if="['退货', '换货'].includes(aftersale.type) && aftersale.return_addr && aftersale.return_addr.addr" class="address-area padding-lr margin-tb-sm">
			<view class="dflex padding-top-xs margin-bottom-xs margin-left-sm">
				<view class="ft-dark">{{aftersale.type}}地址</view>
				<view class="copy ft-dark-4 scale-09" @click.stop="copyAddr">复制</view>
			</view>
			<view class="dflex padding border-radius bg-main">
				<view class="iconfont icondizhi- margin-right ft-main"></view>
				<view class="flex1">
					<view class="w-full dflex-wrap-w">
						<view class="margin-bottom-xs desc">
							<text class="clamp-2">{{ aftersale.return_addr.addr }} {{ aftersale.return_addr.addr_detail }}</text>
						</view>
						<view>
							<text>{{ aftersale.return_addr.consignee }}</text>
							<text class="margin-left">{{ aftersale.return_addr.mobile }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view v-if="['退货', '换货'].includes(aftersale.type) && aftersale.return_express && aftersale.return_express.com" class="address-area padding-lr margin-tb-sm">
			<view class="order-area padding-tb-sm padding-lr bg-main border-radius">
				<view class="item dflex-b">
					<text>快递公司</text>
					<view class="dflex fs-xs ft-dark" @click="toExpress(2)">
						{{ aftersale.return_express.com }}
						<text v-if="aftersale.sub_state === '待签收' || ['已完成', '已拒绝'].includes(aftersale.state)" class="copy ft-dark-4 scale-09">查看物流</text>
					</view>
				</view>
				<view class="item dflex-b">
					<text>快递单号</text>
					<text class="fs-xs ft-dark">{{ aftersale.return_express.no }}</text>
				</view>
				<view v-if="aftersale.return_express.remark" class="item dflex-b">
					<text>备注说明</text>
					<text class="fs-xs ft-dark">{{ aftersale.return_express.remark }}</text>
				</view>
			</view>
		</view>
		
		<!-- 换货地址 -->
		<view v-if="['换货'].includes(aftersale.type) && aftersale.exchange_addr && aftersale.exchange_addr.addr" 
			class="address-area padding-lr margin-tb-sm">
			<view class="dflex padding-top-xs margin-bottom-xs margin-left-sm">
				<view class="ft-dark">收货地址</view>
			</view>
			<view class="dflex padding border-radius bg-main">
				<view class="iconfont icondizhi- margin-right ft-main"></view>
				<view class="flex1">
					<view class="w-full dflex-wrap-w">
						<view class="margin-bottom-xs desc">
							<text class="clamp-2">{{ aftersale.exchange_addr.addr }} {{ aftersale.exchange_addr.addr_detail }}</text>
						</view>
						<view>
							<text>{{ aftersale.exchange_addr.consignee }}</text>
							<text class="margin-left">{{ aftersale.exchange_addr.mobile }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view v-if="['换货'].includes(aftersale.type) && aftersale.exchange_express && aftersale.exchange_express.com" class="address-area padding-lr margin-tb-sm">
			<view class="order-area padding-tb-sm padding-lr bg-main border-radius">
				<view class="item dflex-b">
					<text>快递公司</text>
					<view class="dflex fs-xs ft-dark" @click="toExpress(3)">
						{{ aftersale.exchange_express.com }}
						<text v-if="['已完成', '已拒绝'].includes(aftersale.state)" class="copy ft-dark-4 scale-09">查看物流</text>
					</view>
				</view>
				<view class="item dflex-b">
					<text>快递单号</text>
					<text class="fs-xs ft-dark">{{ aftersale.exchange_express.no }}</text>
				</view>
				<view v-if="aftersale.exchange_express.remark" class="item dflex-b">
					<text>备注说明</text>
					<text class="fs-xs ft-dark">{{ aftersale.exchange_express.remark }}</text>
				</view>
			</view>
		</view>
		
		<!-- 售后数据 -->
		<view class="order-area padding-tb-sm padding-lr margin-lr margin-top margin-bottom-sm bg-main border-radius">
			<view class="item dflex-b">
				<text>售后编号</text>
				<view class="dflex fs-xs ft-dark" @click="copy">
					{{ aftersale._id }}
					<text class="copy ft-dark-4 scale-09">复制</text>
				</view>
			</view>
			<view class="item dflex-b">
				<text>申请时间</text>
				<text class="fs-xs ft-dark">{{ $api.format(aftersale.create_time) }}</text>
			</view>
			<view v-if="['已完成', '已取消', '已拒绝'].includes(aftersale.state)" class="item dflex-b">
				<text>{{aftersale.state.replace('已', '')}}时间</text>
				<text class="fs-xs ft-dark">{{ $api.format(aftersale.last_modify_time) }}</text>
			</view>
			<view v-if="['已拒绝'].includes(aftersale.state)" class="item dflex-b" style="align-items: baseline;">
				<text class="">拒绝原因</text>
				<text class="flex1 fs-xs ft-dark clamp-lh clamp-2 tar margin-left">{{ aftersale.remark }}</text>
			</view>
		</view>
		
		<view v-if="['退款', '退货'].includes(aftersale.type)" class="order-area padding-tb-sm padding-lr margin-lr margin-tb-sm bg-main border-radius">
			<view class="item dflex-b">
				<text>退款方式</text>
				<text class="fs-xs ft-dark">{{ aftersale.refund_way || '--' }}</text>
			</view>
			<view class="item dflex-b">
				<text>退款金额</text>
				<text class="fs-xs ft-dark">￥{{ ((aftersale.refund_rebate || aftersale.refund_amount) / 100) || '--' }}</text>
			</view>
		</view>

		<!-- 售后数据 -->
		<view v-if="aftersale && aftersale.state" class="order-area padding-tb-sm padding-lr margin-lr margin-tb-sm bg-main border-radius">
			<view class="item dflex-b">
				<text>{{aftersale.type}}原因</text>
				<text class="fs-xs ft-dark">{{ aftersale.reason }}</text>
			</view>
			<view class="item dflex-b" style="align-items: baseline;">
				<text>{{aftersale.type}}说明</text>
				<text class="flex1 fs-xs ft-dark clamp-lh clamp-2 tar margin-left">{{ aftersale.desc || '--' }}</text>
			</view>
			<view class="item dflex-b">
				<text>{{aftersale.type}}状态</text>
				<text class="fs-xs ft-dark">{{ aftersale.state }}</text>
			</view>
			<view v-if="aftersale.remark" class="item dflex-b" style="align-items: baseline;">
				<text>{{aftersale.type}}情况</text>
				<text class="flex1 fs-xs ft-dark clamp-lh clamp-2 tar margin-left">{{ aftersale.remark }}</text>
			</view>
		</view>
		
		<view class="safe-area-inset-bottom" style="height: 200rpx;"></view>

		<!-- 底部操作区 -->
		<view class="oper-area dflex-b padding-right padding-left-sm safe-area-inset-bottom">
			<view class="dflex">
				<view class="btn-area dflex dflex-flow-c" @click="tohome">
					<text class="iconfont iconshouye-1"></text>
					<text>首页</text>
				</view>
				<!-- #ifdef MP-WEIXIN -->
				<button class="btn no-border" open-type="contact">
					<view class="btn-area dflex dflex-flow-c">
						<text class="iconfont iconkefu-01"></text>
						<text>客服</text>
					</view>
				</button>
				<!-- #endif -->
			</view>

			<view class="dflex-e">
				<view v-if="aftersale.state == '待处理' || aftersale.sub_state == '待寄回'" class="dflex">
					<button class="action-btn" @click="cancelOrder">取消售后</button>
				</view>
				
				<view v-if="aftersale.sub_state == '待寄回'" class="dflex">
					<button class="action-btn main-btn" @click="fillInExpress">填写快递单号</button>
				</view>
				
				<button v-if="['待收货'].includes(aftersale.sub_state)" class="action-btn" @click="toExpress(2)">查看物流</button>
				<button v-if="['待签收'].includes(aftersale.sub_state)" class="action-btn" @click="toExpress(3)">查看物流</button>
				<view v-if="aftersale.sub_state == '待签收'" class="dflex">
					<button class="action-btn main-btn" @click="toReceipt">确认收货</button>
				</view>
				
				<view v-if="['已取消', '已完成', '已拒绝'].includes(aftersale.state)">
					<button @click="delOrderAftersale" class="action-btn main-btn">删除售后</button>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	
	export default {
		components: {
			// share
		},
		computed: {
			...mapState(['islogin', 'member']),
			order_title() {
				switch(this.order_data.state) {
					case '待付款':
						return '售后待支付';
					case '待成团':
						return '待成团';
					case '待收货':
						return '售后已发货';
				}
				
				return '';
			},
			order_time_tip() {
				switch(this.order_data.state) {
					case '待付款':
						return '剩余时间 ';
					case '待成团':
						return '剩余时间 ';
					case '待收货':
						return '自动收货剩余时间';
				}
				
				return '';
			}
		},
		data() {
			return {
				isload: false,
				// 商品数据
				order_detail: [],
				// 售后数据
				order_data: {},
				// 售后数据
				aftersale: {},
				addressData: [],
				order_id: '',
				goods_price_tip: '产品总计',
				time_remaining: 0,
				order_config: {},
			};
		},
		onUnload() {
			uni.$emit('__event_order', 'refresh');
		},
		onLoad(res) {
			this.aftersale_id = res.id;
			if (!this.aftersale_id) {
				this.$api.msg('售后ID不存在');
				return;
			}
			
			uni.showLoading({
				title: '加载中'
			});
		},
		onShow() {
			uni.hideLoading();
			
			this.loadData();
		},
		methods: {
			tohome() {
				this.$api.tohome();
			},
			loadData() {
				if (!this.aftersale_id) return;
				
				this.$func.usemall.call('orderaftersale/detail', {
					aftersale_id: this.aftersale_id
				}).then(res => {
					uni.hideLoading();
					if (res.code === 200) {
						
						this.aftersale = res.datas.aftersale;
						this.order_config = res.datas.order_config || {};
						this.order_data = res.datas.order;
						this.order_detail = res.datas.order_detail;
						this.addressData = res.datas.order_trip;
						this.time_remaining = res.datas.time_remaining;
						
						this.order_detail.forEach(data => {
							if (data.goods_opt_id > 0) {
								let desc = '';
								if (data.goods_opt_desc) {
									desc = ' (' + data.goods_opt_desc + ')';
								}
								this.goods_price_tip = data.goods_opt_name + desc;
							}
						});
						
						this.isload = true;
						return;
					}
					
					this.$api.alert(res.msg, () => {
						this.$api.back();
					});
				})
			},
			// 查看物流
			toExpress(type) {
				uni.navigateTo({
					url: `/sub-user/pages/order/order-express?aftersale_id=${this.aftersale_id}&type=${type}`
				});
			},
			// 已收货
			toReceipt() {
				uni.showModal({
					title: '提示',
					content: '确认收货',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('orderaftersale/received', {
								aftersale_id: this.aftersale_id
							}).then(res => {
								this.loadData('refresh');
							});
						}
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			// 删除售后
			delOrderAftersale() {
				uni.showModal({
					title: '提示',
					content: '删除售后',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('orderaftersale/deleted', {
								aftersale_id: this.aftersale_id,
							}).then(res => {
								if (res.code === 200) {
									uni.navigateBack({});
								}
							})
						} 
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			// 取消售后
			cancelOrder() {
				uni.showModal({
					title: '提示',
					content: '取消售后',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('orderaftersale/cancel', {
								aftersale_id: this.aftersale_id,
								state: '已取消'
							}).then(res => {
								if (res.code === 200) {
									this.loadData('refresh');
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
			// 点击复制地址
			copyAddr() {
				const aftersale = this.aftersale;
				const datas = [
					aftersale.return_addr.addr.replaceAll('-', '') + aftersale.return_addr.addr_detail,
					aftersale.return_addr.consignee,
					aftersale.return_addr.mobile
				];
				uni.setClipboardData({
					data: datas.join('，'),
					success: (res) => {
						uni.getClipboardData({
							success: (res) => {
								uni.showToast({
									title: '复制成功'
								});
							}
						});
					}
				});
			},
			// 点击复制
			copy() {
				uni.setClipboardData({
					data: this.aftersale_id,
					success: (res) => {
						uni.getClipboardData({
							success: (res) => {
								uni.showToast({
									title: '复制成功'
								});
							}
						});
					}
				});
			},
			// 填写快递单号
			fillInExpress() {
				uni.navigateTo({
					url: `/sub-user/pages/order/aftersale/express?id=${this.aftersale_id}`
				});
			},
			// 评价
			evaluate() {
				uni.navigateTo({
					url: `/sub-user/pages/order/order-evaluate?id=${this.aftersale_id}`
				});
			},
			// 跳转商品详情页
			toGoodsDetail(res) {
				const params = {
					id: res.goods_id,
					__type: ''
				};
				
				if (res.group_id) {
					// 拼团活动
					params.__type = 'group';
					params.group_id = res.group_id;
				}
				
				if (res.seckill_id) {
					// 秒杀活动
					params.__type = 'seckill';
					params.seckill_id = res.seckill_id;
				}
				
				this.$api.togoods(params);
			},
			toGroupShare() {
				this.toShare({});
			},
			toShare(res) {
				if (res.uid) return;
				
				let url = '';
				
				// #ifdef MP-WEIXIN
				uni.showLoading({
					title: '打开分享中'
				});
				// #endif
				
				// #ifdef H5
				url = `${location.protocol}//${location.host}/#/sub-marketing/pages/group-join?id=${this.groupChiefData._id}&mid=${this.member._id}`;
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
			},
			// 已过期
			removeData() {
				// 重新加载数据
				this.loadData();
			}
		},
		
		onShareAppMessage: function(ops) {
			console.log('onShareAppMessage', ops);
			let mid = 0;
			if (this.member && this.member._id) {
				mid = this.member._id;
			}
			
			let image = '';
			let title = this.$config.appname || '用云电商';
			let path = `/pages/tabbar/home?mid=${mid}`;
			
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
	}
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.order-detail .item text:first-child {
		width: max-content;
		display: inline-block;
	}

	/* 状态区 */
	.state-area {}

	/* 收货人 */
	.address-area {}

	/* 商品区 */
	.goods-area {
		&:last-child {
			margin-bottom: 0;
		}

		image {
			width: 180rpx;
			height: 180rpx;
		}
	}

	/* 售后数据区 */
	.order-area {
		.item {
			line-height: 66rpx;
		}
	}

	.copy {
		margin-left: 20rpx;
		padding: 12rpx 24rpx;
		background-color: #f1f1f1;
		border-radius: 40rpx;
		font-size: 22rpx;
		line-height: 1;
		width: auto !important;
		transform-origin: right center;
	}

	/* 数据统计区 */
	.total-area {
		.item {
			line-height: 48rpx;
			
			text{
				text-align: right;
			}
		}
	}

	/* 操作区 */
	.oper-area {
		width: 100%;
		height: 100rpx;
		height: calc(env(safe-area-inset-bottom) + 100upx);
		background-color: #fff;
		position: fixed;
		z-index: 1;
		bottom: 0;
		left: 0;
		border-top: 1px solid #f0f0f0;

		.btn-area {
			font-size: $font-sm;
			color: $font-color-base;
			width: 96rpx;

			.iconfont {
				font-size: 40rpx;
				line-height: 48rpx;
			}
		}
	}
	
	/* 操作按钮 */
	.action-btn {
		min-width: 156rpx;
		height: inherit;
		line-height: inherit;
		margin: 0;
		margin-left: 20rpx;
		padding: 12rpx 30rpx;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		background: #fff;
		border-radius: 100px;
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
	
</style>
