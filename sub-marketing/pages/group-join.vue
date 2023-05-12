<template>
	<view v-if="isload" class="">
		<use-navbar title="好友拼单"></use-navbar>
		
		<!-- 参团状态 -->
		<view class="state-area margin-lr-sm margin-tb-sm">
			<view class="padding border-radius bg-base">

				<view v-if="['待付款', '待成团', '待收货'].includes(order_data.state)">
					<view class="dflex-c fs-lg">
						<text class="iconfont icondaifukuan- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">{{order_title}}</text>
					</view>
					<view class="dflex-c">
						{{order_time_tip}}
						<use-count-down
							ref="uCountDown"
							fontSize="26"
							separatorSize="26"
							color="#fff"
							bgColor="#ff6a6c"
							:showDays="true"
							separatorColor="#fff"
							:timestamp="expiresTime"
							@end="removeData"
							></use-count-down>
					</view>
				</view>

				<view v-if="order_data.state == '待发货'">
					<view class="dflex-c fs-lg">
						<text class="iconfont iconyiwancheng- fs-lg fwb"></text>
						<text class="fwb margin-left-sm">订单备货中</text>
					</view>
					<view v-if="Math.ceil(expiresTime / 24 * 60 * 60)" class="dflex-c">预计{{Math.ceil(expiresTime / 24 * 60 * 60)}}天后发货</view>
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
			</view>
		</view>
		
		<!-- 参团情况 -->
		<view v-if="groupData && groupData._id" class="use-area margin-bottom-sm overflow-hidden pos-r margin-lr-sm">
			<view class="dflex-b ft-base pos-a pos-t-full padding-tb-sm padding-lr" style="background-color: #f5e7e6;" @click.stop="toGroupNotice">
				<text v-if="groupUnMemberCnt">{{groupData.group_num}}人团，还差{{groupUnMemberCnt}}人</text>
				<text v-else>{{groupData.group_num}}人团，待参团人员支付</text>
				<view class="dflex">
					<text>攻略</text>
					<view class="iconfont iconjiantou-01 fs-sm ft-base"></view>
				</view>
			</view>
			<view class="padding-lg w-full"></view>
			
			<view class="dflex" style="align-items: flex-start;">
				<view v-for="(item, idx) in groupChiefData.group_members" :key="idx" class="margin-right-xl dflex-c dflex-flow-c pos-r">
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
				</view>
			</view>
		</view>
		
		<!-- 拼单商品明细 -->
		<view class="padding margin-lr-sm margin-tb-sm bg-main border-radius">
			<view v-for="(item, idx) in order_detail" :key="idx" class="goods-area" 
				:class="{ 'margin-top': idx > 0 }"
				@click="toGoodsDetail(item)">
				<view class="dflex pos-r">
					<view class="img">
						<image :src="item.goods_sku_img || item.goods_img"></image>
					</view>
					<view class="margin-left-sm">
						<text class="clamp-2">{{ item.goods_name }} {{ item.goods_name_pw }}</text>
						<view class="ft-dark fs-xs padding-top-xs">
							<text class="margin-right">× {{item.goods_num}}</text>
							{{ item.goods_sku_name || '&nbsp;&nbsp;' }}
						</view>
						<view class="margin-top-sm dflex-b">
							<text class="price">{{ item.goods_price / 100 }}</text>
							
							<button v-if="!order_data.order_refund_state && ['待收货', '待评价', '已完成'].includes(order_data.state)" 
								class="action-btn" @click.stop="choiceAfterSale(item)">申请售后</button>
						</view>
					</view>
					
					<view v-if="item.goods_price_tag" class="use-tag pos-a pos-top bg-base margin-right-sm">{{item.goods_price_tag}}</view>
					<view v-else-if="item.is_vip === '是'" class="use-tag pos-a pos-top bg-base margin-right-sm">会员价</view>
				</view>
			</view>
		</view>

		<!-- 07. 操作区 -->
		<view class="oper-area pos-f dflex-b w-full padding-lr-sm safe-area-inset-bottom">
			<view class="btn-area dflex dflex-flow-c use-hover" @click="tohome">
				<text class="iconfont iconshouye-1"></text>
				<text>首页</text>
			</view>
		
			<!-- <view class="btn-area dflex dflex-flow-c use-hover" @click="tochat">
				<text class="iconfont iconkefu-01"></text>
				<text>Usekf</text>
			</view> -->
		
			<!-- #ifdef MP-WEIXIN -->
			<button class="btn no-border dflex use-hover" open-type="contact">
				<view class="btn-area dflex-c dflex-flow-c">
					<text class="iconfont iconkefu-01"></text>
					<text>客服</text>
				</view>
			</button>
			<!-- #endif -->
			
			<button class="btn no-border dflex use-hover" open-type="share" @click="toShare">
				<view class="btn-area dflex dflex-flow-c use-hover">
					<text class="iconfont iconfenxiang"></text>
					<text>分享</text>
				</view>
			</button>
			
			<!-- 拼团活动 -->
			<view class="flex1 btn-container dflex-b border-radius-big">
				<view v-if="groupChiefData.state == '参团中'" class="dflex-c dflex-flow-c padding-tb-sm flex1 bg-warn use-hover ft-white" @click="tobuy(1)">
					<text>发起拼团</text>
				</view>
				<view v-if="groupChiefData.state == '参团中'" class="dflex-c dflex-flow-c padding-tb-sm flex1 use-hover"
					:class="[ groupUnMemberCnt || hasJoin ? 'bg-base' : 'bg-disabled' ]"
					@click="tobuy(2)">
					<text v-if="hasJoin">{{ hasPaid ? '查看订单' : '立即支付' }}</text>
					<text v-else>{{ groupUnMemberCnt ? '参与拼单' : '团已满员' }}</text>
				</view>
				<view v-if="groupChiefData.state != '参团中'" class="tac padding-tb-sm flex1 bg-disabled">拼单{{ groupChiefData.state }}</view>
			</view>
		</view>
		
		<!-- 规格弹出框 -->
		<use-popup mode="bottom" bgclass=" " :close-icon="true" v-model="specShow">
			<view class="bg-main padding border-radius-top30 safe-area-inset-bottom"
				style="min-height: 66vh; max-height: 80vh;">
				<view class="dflex margin-top-xs">
					<!-- 当前选中的SKU图片 -->
					<image :src="sku.img || goods.img" style="width: 100rpx; height: 100rpx;" mode="aspectFill"></image>
					<view class="margin-left-sm">
						<view class="dflex" style="align-items: flex-end;">
							<text v-if="goods_price_tag" class="use-tag bg-base margin-right-sm">{{goods_price_tag}}</text>
							<view class="price fs-big">{{ goods_price }}</view>
							<view class="margin-left-sm">
								<text class="ft-dark fs-xs">原价</text>
								<text class="price fs-xs ft-dark">{{ goods_m_price }}</text>
							</view>
						</view>
						<view class="use-tags margin-0 margin-top-sm">
							<view>包邮</view>
						</view>
					</view>
				</view>
				<scroll-view v-if="goods && goods.skus" class="overflow-auto" style="max-height: 50vh;" scroll-y>
					<block v-for="(item, idx) in goods.skus.filter(x => x.enable && x.arrs && x.arrs.length > 0)" :key="idx">
						<view class="margin-tb-sm">
							<text class="fwbd">{{item.name}} ({{item.arrs.length}})</text>
						</view>
						<view class="dflex dflex-wrap-w">
							<view class="dflex margin-right-sm margin-bottom-sm use-hover"
								v-for="(spec, specIdx) in item.arrs" :key="specIdx" @click="specSelected(idx, specIdx)"
								:class="{ 'tag-base': item.curIdx === specIdx, 'tag-gray': item.curIdx !== specIdx }">
								<view>
									{{spec}}
								</view>
							</view>
						</view>
					</block>
				</scroll-view>
		
				<view class="padding-tb-sm margin-top dflex-b pos-r">
					<view class="dflex pos-r" style="top: 10rpx;">
						<view class="">
							购买数量
						</view>
						<text class="margin-left-sm ft-dark fs-xs">库存{{goods.stock_num}}件</text>
					</view>
					
					<use-number-box direction="right" :min="1" :max="goods.limit || goods.stock_num || 1" 
						:value="goods_num" :is-max="goods_num >= goods.limit || goods.stock_num" :is-min="goods_num === 1"
						:disabled="goods_num >= goods.limit || goods.stock_num" @eventChange="numberChange">
					</use-number-box>
				</view>
				<view class="w-full" style="height: 160rpx;"></view>
				<view class="pos-a pos-b-full padding safe-area-inset-bottom-plus dflex-c">
					<!-- 秒杀或拼团活动模式 -->
					<view v-if="groupChiefData.state == '参团中'" class="dflex-c dflex-flow-c padding-tb-sm flex1 bg-warn use-hover ft-white" @click="tobuy(1)">
						<text>发起拼团</text>
					</view>
					<view v-if="groupChiefData.state == '参团中'" class="dflex-c dflex-flow-c padding-tb-sm flex1 bg-base use-hover" @click="tobuy(2)">
						<text>{{ '参与拼单' }}</text>
					</view>
					<view v-if="groupChiefData.state != '参团中'" class="tac padding-tb-sm flex1 bg-disabled">活动已结束</view>
				</view>
			</view>
		</use-popup>
		
		<!-- 05. 热门推荐 -->
		<use-hot-goods title-type="round" title="热门推荐"></use-hot-goods>
		
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
			},
			goods_price() {
				// 拼团价
				if (this.groupData && this.groupData.goods_obj) {
					return this.groupData.goods_price / 100;
				}
				
				return this.goods.price / 100 || 0;
			},
			goods_m_price() {
				// 拼团活动，显示原价
				if (this.groupData && this.groupData.goods_obj) {
					return this.groupData.goods_obj.market_price / 100;
				}
				
				return this.goods.market_price / 100
			},
		},
		data() {
			return {
				isload: false,
				// 商品数据
				order_detail: [],
				// 订单数据
				order_data: {},
				// 商品ID
				goods_id: '',
				goods_num: 1,
				goods: {},
				goods_price_tag: '拼团价',
				// SKU
				sku: {},
				skuDatas: [],
				isSkus: false,
				// 商品规格
				spec: '',
				specShow: false,
				specShowData: [],
				
				groupData: {},
				groupChiefData: {},
				expiresTime: 0,
				// 未参团人数
				groupUnMemberCnt: 0,
				groupNoticeShow: false,
				groupNotice: '',
				
				joinData: {},
				hasJoin: false,
				hasPaid: false
			};
		},
		watch: {
			sku(nv, ov) {
				console.log('sku', nv, ov);
				// 秒杀价
				
				// 拼团价
				
				// 会员价
				this.goods.vip_price = nv.vip_price || 0;
				this.goods.vip = this.goods.vip_price > 0;
		
				this.goods.price = nv.price;
				this.goods.market_price = nv.market_price;
				this.goods.stock_num = nv.stock_num;
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.loadData(() => {
				uni.stopPullDownRefresh();
			});
		},
		onUnload() {
			uni.$emit('__event_order', 'refresh');
		},
		onLoad(options) {
			if (!options.id || options.id.split('_').length !== 2) {
				this.$api.alert('拼单参数错误，请重新参与', () => {
					this.$api.back();
				});
				return;
			}
			
			this.id = options.id;
			
			if (!this.islogin) {
				this.$api.tologin();
				return;
			}
		},
		onShow() {
			uni.hideLoading();
			
			if (this.id && this.islogin) {
				uni.showLoading({
					title: '加载中'
				})
				
				this.loadData();
			}
		},
		methods: {
			tohome() {
				this.$api.tohome();
			},
			loadData(callback) {
				if (!this.id) {
					if (typeof callback === 'function') {
						// 数据加载完成回调函数
						callback();
					}
					return;
				} 
				
				this.$func.usemall.call('marketing/groupbuy/joinData', {
					id: this.id
				}).then(res => {
					console.log('joinData res', res);
					uni.hideLoading();
					
					if (typeof callback === 'function') {
						// 数据加载完成回调函数
						callback();
					}
					
					if (res.code === 200) {
						res = res.result;
						this.order_config = res.order_config || {};
						
						this.order_data = res.order;
						this.order_detail = res.order_detail;
						
						this.expiresTime = res.expire_time;
						if (this.expiresTime <= 0) {
							this.removeData();
						}
						
						this.groupData = res.group;
						this.groupChiefData = res.group_chief;
						if (this.groupChiefData && this.groupChiefData._id) {
							// 参团数据
							this.joinData = this.groupChiefData.group_members.find(x => x.uid == this.member._id) || {};
							// 已参团
							this.hasJoin = !!this.joinData.uid;
							// 已付款
							this.hasPaid = this.joinData.state == '已付款';
							
							// 剩余未参团人数
							this.groupUnMemberCnt = this.groupData.group_num - this.groupChiefData.group_members.length;
							for (let i = 0; i < this.groupUnMemberCnt; i++) {
								this.groupChiefData.group_members.push({
									uname: '待参团'
								});
							}
						}

						// 订单详情
						this.order_detail.forEach(data => {
							this.goods_id = data.goods_id;
							
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
			
			// 立即购买
			tobuy(type) {
				if (!this.loginCheck()) return;
				
				if (!this.groupUnMemberCnt && !this.hasJoin) {
					this.$api.msg('当前拼单已满员，可发起新的拼团');
					return;
				}
				
				// 如果存在多规格SKU，判断 specShow 是否已打开
				if (this.isSkus) {
					if (!this.specShow) {
						this.specShow = true;
						return;
					}
			
					if (!this.sku || !this.sku._id) {
						this.$api.msg('请选择购买的规格');
						return;
					}
				}
				
				let url = `/sub-goods/pages/order/create?goods_id=${this.goods_id}&goods_num=${this.goods_num}&sku_id=${this.sku._id || ''}&group_id=${this.groupData._id}`;
				if (type == 2) {
					url = `/sub-goods/pages/order/create?goods_id=${this.goods_id}&goods_num=${this.goods_num}&sku_id=${this.sku._id || ''}&group_id=${this.groupData._id}&group_chief_id=${this.groupChiefData._id}&expires_time=${this.$refs.uCountDown.nowdate}`;
					
					if (this.hasPaid) {
						// 已支付，跳转订单详情
						url = `/sub-user/pages/order/order-detail?order_id=${this.joinData.order_id}`;
					} else if (this.hasJoin) {
						// 已参团，跳转立即支付
						this.$api.topay({
							order_id: this.joinData.order_id,
							money: this.order_data.order_actural_paid
						});
						return;
					}
				}
				
				uni.navigateTo({
					url: url
				});
			},
			
			// 取消订单
			cancelOrder() {
				uni.showModal({
					title: '提示',
					content: '取消订单',
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
								}
							})
						} 
					},
					complete() {
						uni.hideLoading();
					}
				});
			},
			numberChange() {
				
			},
			
			// 检测是否已登录
			loginCheck() {
				if (!this.islogin) {
					uni.showModal({
						title: '授权登录',
						success: (res) => {
							if (res.confirm) {
								this.$api.tologin();
							}
						}
					});
					return false;
				}
			
				return true;
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
			toShare(res) {
				if (res.uid) return;
				
				let url = '';
				
				// #ifdef MP-WEIXIN
				uni.showLoading({
					title: '打开分享中'
				});
				// #endif
				
				// #ifdef H5
				url = 'https://usemall-h5.use-cloud.com';
				if (location.hostname !== 'localhost') {
					url = `${location.protocol}//${location.hostname}`;
				}
				url = `${url}/#/${this.$api.getCurPageFullUrl({ mid: this.member._id })}`;
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
			removeData(res) {
				if (this.groupChiefData && this.groupChiefData._id) {
					this.$api.alert('拼单活动已结束', () => {
						this.$api.back();
					});
				}
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
