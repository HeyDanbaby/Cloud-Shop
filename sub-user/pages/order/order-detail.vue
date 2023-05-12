<template>
	<view v-if="isload" class="order-detail">
		<use-navbar title="订单详情"></use-navbar>
		
		<!-- 订单状态 -->
		<view class="state-area padding-lr margin-tb-sm">
			<view class="padding border-radius bg-base">

				<view v-if="['待付款', '待成团', '待收货'].includes(order_data.state)">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">{{order_title}}</text>
					</view>
					<view class="dflex-c">
						{{order_time_tip}}
						<use-count-down
							fontSize="26"
							separatorSize="26"
							color="#fff"
							bgColor="#ff6a6c"
							:showDays="true"
							separatorColor="#fff"
							:timestamp="time_remaining"
							@end="removeData"
							></use-count-down>
					</view>
				</view>

				<view v-if="order_data.state == '待发货'">
					<view class="dflex-c fs-lg">
						<text class="iconfont iconyiwancheng- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单备货中</text>
					</view>
					<view v-if="Math.ceil(time_remaining / (24 * 60 * 60))" class="dflex-c">预计{{Math.ceil(time_remaining / (24 * 60 * 60))}}天内发货</view>
				</view>
				
				<view v-if="order_data.state == '待评价'">
					<view class="dflex-c fs-lg">
						<text class="iconfont iconyiwancheng- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单已收货</text>
					</view>
					<view class="dflex-c">{{order_config.received_goods_tip || '感谢您的支持，去好评'}}</view>
				</view>
				
				<view v-if="order_data.state == '已完成'">
					<view class="dflex-c fs-lg">
						<text class="iconfont iconyiwancheng- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单已完成</text>
					</view>
					<view class="dflex-c">{{order_config.completed_tip || '感谢您的支持，期待下次相遇'}}</view>
				</view>

				<view v-if="order_data.state == '已取消'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单已关闭</text>
					</view>
					<view class="dflex-c">{{order_config.closed_tip || '感谢您的支持！'}}</view>
				</view>
				
				<view v-if="order_data.state == '售后中'">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">已申请售后</text>
					</view>
					<view class="dflex-c">请耐心等待工作人员处理</view>
				</view>
			</view>
		</view>
		
		<!-- 参团情况 -->
		<view v-if="groupData && groupData._id" class="use-area  margin-bottom-sm overflow-hidden pos-r margin-lr">
			<view class="dflex-b ft-base pos-a pos-t-full padding-tb-sm padding-lr" style="background-color: #f5e7e6;" @click.stop="toGroupNotice">
				<text v-if="groupUnMemberCnt">{{groupData.group_num}}人团，还差{{groupUnMemberCnt}}人</text>
				<text v-else>{{groupData.group_num}}人团，拼单{{ groupChiefData.state }}</text>
				<view class="dflex">
					<text>攻略</text>
					<view class="iconfont iconjiantou-01 fs-sm ft-base"></view>
				</view>
			</view>
			<view class="padding-lg w-full"></view>
			
			<view class="dflex" style="align-items: flex-start;">
				<view v-for="(item, idx) in groupChiefData.group_members" :key="idx" class="margin-right-xl dflex-c dflex-flow-c pos-r">
					<button class="dflex-c dflex-flow-c no-border btn use-hover" :open-type="!item.uid ? 'share' : ''" @click="toShare(item)">
						<view class="pos-r dflex-c group-user">
							<image v-if="item.uheadimg" mode="aspectFit" class="headimg image-sm border-radius-c" :src="item.uheadimg"></image>
							<view v-else class="headimg image-sm border-radius-c dflex-c">
								<text class="iconfont iconchangjianwenti-01 fs-xxl line-height-1 ft-dark"></text>
							</view>
							
							<view v-if="item.state" class="fs-xxs pos-a pos-bottom line-height-1 border-radius-xs scale-09" 
								style="bottom: -10rpx; padding: 4rpx 6rpx; transform-origin: center;"
								:class="[ idx == 0 ? 'bg-base' : 'bg-trans' ]">{{ idx == 0 ? '团长' : item.state }}</view>
						</view>
					
						<view class="fs-xs margin-top-xs" :class="[ item.uid ? 'ft-base' : 'ft-dark' ]">{{item.uname}}</view>
					</button>
				</view>
			</view>
		</view>
		
		<!-- 收货人 -->
		<view class="address-area padding-lr margin-tb-sm" v-if="order_data.order_consignee">
			<view class="dflex padding border-radius bg-main">
				<view class="iconfont icondizhi- margin-right ft-main"></view>
				<view class="flex1">
					<view class="w-full dflex-wrap-w">
						<view class="margin-bottom-xs desc">
							<text class="clamp-2">{{ order_data.order_consignee_addr }} {{ order_data.order_consignee_addr_detail }}</text>
						</view>
						<view>
							<text>{{ order_data.order_consignee }}</text>
							<text class="margin-left">{{ order_data.order_consignee_tel }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 订单商品明细 -->
		<view class="padding margin-lr margin-tb-sm bg-main border-radius">
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
							<text class="price">{{ (item.goods_amount || item.goods_price) / 100}}</text>
							
							<!-- 商品售后 -->
							<button v-if="canAftersale(order_data, item)" class="action-btn border-radius-big bg-main" 
								@click.stop="choiceAftersale(order_data, item)">申请售后</button>
							<text v-else-if="goodsAftersaleState(order_data, item)" 
								@click.stop="toAftersaleDetail(item.aftersale_id)"
								:class="{ 'ft-base': item.aftersale_state === 1, 'ft-dark': item.aftersale_state === 2 }">{{goodsAftersaleState(order_data, item)}}</text>
						</view>
					</view>
					
					<view v-if="item.goods_price_tag" class="use-tag pos-a pos-top bg-base margin-right-sm">{{item.goods_price_tag}}</view>
					<view v-else-if="item.is_vip === '是'" class="use-tag pos-a pos-top bg-base margin-right-sm">会员价</view>
				</view>
			</view>
		</view>

		<!-- 订单数据 -->
		<view class="order-area padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="item dflex-b">
				<text>订单编号</text>
				<view class="dflex fs-xs ft-dark" @click="copy">
					{{ order_data.order_id }}
					<text class="copy ft-dark-4 scale-09">复制</text>
				</view>
			</view>
			<view class="item dflex-b">
				<text>下单时间</text>
				<text class="fs-xs ft-dark">{{ order_data.create_time }}</text>
			</view>
			<view v-if="order_data.state == '已取消'" class="item dflex-b">
				<text>取消时间</text>
				<text class="fs-xs ft-dark">{{ $api.format(order_data.last_modify_time) }}</text>
			</view>
			<view class="item dflex-b">
				<text>支付方式</text>
				<text class="fs-xs ft-dark">{{ order_data.order_pay_way || '--' }}</text>
			</view>
			<view class="item dflex-b">
				<text>支付编号</text>
				<text class="fs-xs ft-dark">{{ order_data.order_pay_no || '--' }}</text>
			</view>
		</view>

		<!-- 售后数据 -->
		<view v-if="order_data.order_aftersale && order_data.order_aftersale.state" 
			class="order-area padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="item dflex-b">
				<text>申请时间</text>
				<text class="fs-xs ft-dark">{{ $api.format(order_data.order_aftersale.time) }}</text>
			</view>
			<view class="item dflex-b">
				<text>{{order_data.order_aftersale.type}}原因</text>
				<text class="fs-xs ft-dark">{{ order_data.order_aftersale.reason }}</text>
			</view>
			<view class="item dflex-b">
				<text>{{order_data.order_aftersale.type}}说明</text>
				<text class="fs-xs ft-dark">{{ order_data.order_aftersale.desc || '--' }}</text>
			</view>
			<view class="item dflex-b">
				<text>{{order_data.order_aftersale.type}}状态</text>
				<text class="fs-xs ft-dark">{{ order_data.order_aftersale.state }}</text>
			</view>
			<view v-if="order_data.order_aftersale.remark" class="item dflex-b">
				<text>{{order_data.order_aftersale.type}}情况</text>
				<text class="fs-xs ft-dark">{{ order_data.order_aftersale.remark }}</text>
			</view>
		</view>
		<!-- 退款数据 -->
		<view v-else-if="order_data.order_refund_state" 
			class="order-area padding margin-lr margin-tb-sm bg-main border-radius">
			<view v-if="order_data.order_refund_reason" class="item dflex-b">
				<text>退款原因</text>
				<text class="fs-xs ft-dark">{{ order_data.order_refund_reason }}</text>
			</view>
			<view v-if="order_data.order_refund_desc" class="item dflex-b">
				<text>退款说明</text>
				<text class="fs-xs ft-dark">{{ order_data.order_refund_desc }}</text>
			</view>
			<view class="item dflex-b">
				<text>退款状态</text>
				<text class="fs-xs ft-dark">{{ order_data.order_refund_state }}</text>
			</view>
			<view class="item dflex-b">
				<text>退款情况</text>
				<text class="fs-xs ft-dark">{{ order_data.order_refund_remark || '原支付方式退回' }}</text>
			</view>
		</view>
		
		<!-- 统计数据 -->
		<view class="total-area padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="dflex-b">
				<view class="item dflex dflex-flow-c row-e ft-dark">
					<text>{{ goods_price_tip}}</text>
					<text>优惠</text>
					<text>运费</text>
					<text class="ft-black fs-sm">实际付款</text>
				</view>
				<view class="item dflex-e dflex-flow-c row-e ft-dark">
					<text class="">￥{{ order_data.order_total_money / 100 }}</text>
					<text class="">￥{{ order_data.order_discount / 100 || 0}}</text>
					<text class="">￥0</text>
					<text class="price">{{ order_data.order_actural_paid / 100 }}</text>
				</view>
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
				<view class="dflex" v-if="order_data.state == '待付款'">
					<button class="action-btn" @click="cancelOrder">取消订单</button>
					<button v-if="order_data.order_pay_state == '待付款'" class="action-btn main-btn"
						@click="payment">立即支付</button>
					<button v-if="order_data.order_pay_state == '待核实'" class="action-btn main-btn"
						@click="payment">待核实</button>
				</view>
				<view class="dflex" v-if="order_data.state == '待成团'">
					<button v-if="!order_data.order_refund_state" class="action-btn"
						@click="cancelOrder">取消拼单</button>
					<button v-if="!order_data.order_refund_state" class="action-btn main-btn" open-type="share"
						@click="toGroupShare">邀请好友</button>
				</view>
				<view class="dflex" v-if="order_data.state == '待发货'">
					<button v-if="!order_data.order_refund_state" class="action-btn bg-main"
						@click="toRefund">申请退款</button>
				</view>
				
				<button v-if="!order_data.order_refund_state && 
					['待收货', '待评价', '已完成'].includes(order_data.state)" class="action-btn" @click="toexpress">查看物流</button>
				<view class="dflex" v-if="order_data.state == '待收货'">
					<button v-if="!order_data.order_refund_state" class="action-btn main-btn" @click="toreceipt">确认收货</button>
				</view>
				<view class="dflex" v-if="order_data.state == '待评价'">
					<button class="action-btn main-btn" @click="evaluate">我要评价</button>
				</view>
				<view v-if="order_data.state == '已完成' || order_data.state == '已取消'"><button @click="delorder" class="action-btn main-btn">删除订单</button></view>
			</view>
		</view>
		
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
		
		<use-popup v-model="groupNoticeShow" bgclass=" " mode="bottom">
			<view class="padding bg-main border-radius-top30" style="max-height: 65vh; min-height: 40vh;">
				<view class="dflex-c padding-lr padding-tb-sm">拼团攻略</view>
				
				<scroll-view v-if="groupNotice" scroll-y style="max-height: 56vh;">
					<rich-text :nodes="groupNotice"></rich-text>
				</scroll-view>
				<use-loading v-else></use-loading>
				
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
		components: {
			// share
		},
		computed: {
			...mapState(['islogin', 'member']),
			order_title() {
				switch(this.order_data.state) {
					case '待付款':
						return '订单待支付';
					case '待成团':
						return '待成团';
					case '待收货':
						return '订单已发货';
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
				// 订单数据
				order_data: {},
				addressData: [],
				sharekefuList: [],
				shareEmptyList: [],
				order_id: '',
				goods_price_tip: '产品总计',
				time_remaining: 0,
				afterSaleTypeShow: false,
				afterSaleTypeDatas: [
					{ id: 1, type: '我要退款', desc: '未收到货，需要申请退款' },
					{ id: 2, type: '我要退货', desc: '已收到货，需要退货并退款' },
					{ id: 3, type: '我要换货', desc: '对货物不满意，申请换货' }
				],
				order_config: {},
				groupData: {},
				groupChiefData: {},
				groupUnMemberCnt: 0,
				groupNoticeShow: false,
				groupNotice: ''
			};
		},
		onUnload() {
			uni.$emit('__event_order', 'refresh');
		},
		onLoad(res) {
			this.order_id = res.order_id;
			if (!this.order_id) {
				this.$api.msg('订单ID不存在');
				return;
			}
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
				if (!this.order_id) return;
				
				uni.showLoading({
					title: '加载中'
				})
				this.$func.usemall.call('order/detail', {
					order_id: this.order_id
				}).then(res => {
					uni.hideLoading();
					if (res.code === 200) {
						res.datas.order.create_time = this.$api.format(res.datas.order.create_time);
						
						if (res.datas.order.order_refund_state == '待退款') {
							res.datas.order.order_refund_remark = '退款预计1小时左右自动退回';
						}
						
						this.order_config = res.datas.order_config || {};
						this.order_data = res.datas.order;
						this.order_detail = res.datas.order_detail;
						this.addressData = res.datas.order_trip;
						this.time_remaining = res.datas.time_remaining;
						
						this.groupData = res.datas.group;
						this.groupChiefData = res.datas.group_chief;
						if (this.groupChiefData && this.groupChiefData._id && this.order_data.state == '待成团') {
							this.groupUnMemberCnt = this.groupData.group_num - this.groupChiefData.group_members.length;
							for (let i = 0; i < this.groupUnMemberCnt; i++) {
								this.groupChiefData.group_members.push({
									uname: '邀请好友'
								});
							}
						}

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
					
					this.$api.msg(res.msg);
				})
			},
			// 立即支付
			payment() {
				if (this.order_data.order_pay_state == '待核实') {
					this.$api.msg('订单已支付待核实状态');
					return;
				}

				this.$api.topay({
					order_id: this.order_data.order_id,
					money: this.order_data.order_actural_paid
				});
			},
			// 查看物流
			toexpress(item) {
				// this.$api.msg('查看物流开发中');
				uni.navigateTo({
					url: `/sub-user/pages/order/order-express?order_id=${this.order_id}`
				});
			},
			// 已发货
			toreceipt() {
				uni.showModal({
					title: '提示',
					content: '确认收货',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('order/received', {
								order_id: this.order_id,
								state: '待评价'
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
			// 删除订单
			delorder() {
				uni.showModal({
					title: '提示',
					content: '删除订单',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('order/deleted', {
								order_id: this.order_id,
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
			// 取消订单
			cancelOrder() {
				let content = '取消订单';
				if (this.order_data.state === '待成团') {
					content = '取消拼单，退款预计1小时左右到账';
				}
				uni.showModal({
					title: '提示',
					content: content,
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '请稍后'
							});
							this.$func.usemall.call('order/cancel', {
								order_id: this.order_id,
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
			// 点击复制
			copy() {
				uni.setClipboardData({
					data: this.order_id,
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
			// 评价
			evaluate() {
				uni.navigateTo({
					url: `/sub-user/pages/order/order-evaluate?id=${this.order_id}`
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
			// 拼团攻略
			toGroupNotice() {
				this.groupNoticeShow = true;
				if (this.groupNotice) {
					return;
				}
				this.$db['usemall-market-groupbuy-param'].tofirst().then(res => {
					console.log('group notice res', res);
					if (res.code == 200) {
						this.groupNotice = res.datas.notice;
					}
				});
			},
			// 已过期
			removeData() {
				// 重新加载数据
				this.loadData();
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
				this.curData = goods;
			},
			// 申请退款
			toRefund() {
				uni.navigateTo({
					url: `/sub-user/pages/order/aftersale/apply?type=1&order_id=${this.order_id}`
				});
			},
			// 申请售后
			toAfterSale(res) {
				this.afterSaleTypeShow = false;
				
				uni.navigateTo({
					url: `/sub-user/pages/order/aftersale/apply?type=${res.id}&order_id=${this.order_id}&goods_id=${this.curData.goods_id}&goods_sku_id=${this.curData.goods_sku_id}`
				});
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
			
			if (this.groupChiefData && this.groupChiefData._id) {
				title = '我正在拼单，邀请您一起参与';
				path = `/sub-marketing/pages/group-join?id=${this.groupChiefData._id}&mid=${mid}`;
			}
			
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

	/* 订单数据区 */
	.order-area {
		.item {
			line-height: 66rpx;

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
		}
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
		width: 156rpx;
		height: inherit;
		line-height: inherit;
		margin: 0;
		margin-left: 20rpx;
		padding: 12rpx 0;
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
	
	.group-user {
		.bg-base {
			background: rgba(255, 106, 108, .85);
		}
		.bg-trans {
			background: rgba(0, 0, 0, .45);
			color: #fff;
		}
	}
	
</style>
