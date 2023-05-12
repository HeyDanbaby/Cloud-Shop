<template>
	<view class="margin-sm">
		<use-navbar title="创建订单"></use-navbar>

		<!-- 收货人 -->
		<use-list-title v-if="!(addrData && addrData._id)" type="round" color="#333" title="选择收货人" iconfont="icondizhi-"
			@goto="toaddr"></use-list-title>
		<view v-else class="use-area dflex-b" @click="toaddr">
			<view class="dflex">
				<view class="iconfont icondizhi- margin-right ft-main"></view>
				<view class="w-full dflex-wrap-w">
					<view class="margin-bottom-xs">
						<text>{{ addrData.address }} {{ addrData.addr_detail }}</text>
					</view>
					<view>
						<text>{{ addrData.consignee }}</text>
						<text class="margin-left">{{ addrData.mobile }}</text>
					</view>
				</view>
			</view>

			<view class="iconfont iconjiantou-01 fs-sm"></view>
		</view>

		<view class="goods-area use-area">
			<!-- 商品列表 -->
			<view class="goods-item" :class="{ 'margin-top': index > 0 }" v-for="(item, index) in goodsDatas"
				:key="index">
				<view class="pos-r">
					<image mode="aspectFill" class="border-radius-sm" lazy-load :src="item.goods.img"></image>
					<view v-if="(item.goods.stock_num < 10 || item.goods.stock_num < item.goods.goods_num)"
						class="disabled dflex-c dflex-flow-c pos-a pos-tl-c border-radius-c">
						<text class="fs-xs">库存不足</text>
						<text class="margin-left-xs fs-xxs" v-if="item.goods.stock_num > 0">剩余{{item.goods.stock_num}}</text>
					</view>
				</view>
				<view class="flex1 padding-left-sm">
					<text class="title clamp-2">{{ item.goods.name || '' }} {{ item.goods.name_pw || '' }}</text>
					
					<view class="pos-r dflex-b padding-top-lg">
						<view class="ft-base fs-xxs flex1">
							<text class="fwb fs-lg margin-right-xs">{{ item.goods.integral }}</text>积分
						</view>

						<!-- + - 数量 -->
						<use-number-box :min="1" :max="item.goods.stock_num"
							:value="item.goods.goods_num > item.goods.stock_num ? item.goods.stock_num : item.goods.goods_num"
							:is-max="item.goods.goods_num >= item.goods.stock_num" :is-min="item.goods.goods_num === 1"
							:index="index" direction="right" @eventChange="numberChange"></use-number-box>
					</view>
				</view>
			</view>
		</view>

		<!-- 金额明细 -->
		<view class="use-area">
			<view class="dflex-b line-height-item">
				<view class="flex1">小计</view>
				<view class="">{{ goods_money }}</view>
			</view>
			<view class="dflex-b line-height-item">
				<view class="flex1">当前积分</view>
				<view class="">{{ member.member_integral }}</view>
			</view>
		</view>

		<view class="use-area">
			<view class="margin-right-xl">备注</view>
			<textarea class="bg-drak w-full border-radius-sm margin-top-sm padding" style="min-height: 70px;"
				v-model="order_desc" maxlength="200" auto-height placeholder="请填写买家备注"></textarea>
		</view>


		<!-- 底部  -->
		<view class="oper-area pos-f pos-b-full w-full dflex-b bg-main safe-area-inset-bottom padding-lr-sm">
			<view class="dflex">
				<text class="fs-sm">需支付</text>
				<view class="ft-base fs-xxs flex1">
					<text class="fwb fs-xl margin-left-sm margin-right-xs">{{ total_money }}</text>积分
				</view>
			</view>
			<view class="submit dflex-c bg-base border-radius-big padding-lr animated-all" :class="is_submit === 1 ? 'bg-disabled' : ''" @click="submit">去支付</view>
		</view>
	</view>
</template>

<script>
	
	import { mapState } from 'vuex';
	
	// 收获人地址
	const _address = 'usemall-member-address'
	export default {
		computed: {
			...mapState(['islogin', 'member'])
		},
		data() {
			return {
				// 收货地址
				addrData: {},
				// 商品数据
				goodsDatas: [],
				// 产品金额
				goods_money: 0,

				// 优惠券金额
				coupon_money: 0,
				// 实付金额
				total_money: 0,

				// 商品 id
				goods_id: 0,
				// 商品数量
				goods_num: 1,
				// 买家备注
				order_desc: '',

				is_submit: 1,
				platform: '',
				platform_name: ''
			};
		},
		onLoad(options) {
			let _this = this;
			this.$api.get_env(res => {
				this.platform = res.platform;
				this.platform_name = res.platform_name;
			});

			// 商品 ids
			this.goods_id = options.goods_id || '';
			// 商品数量 
			this.goods_num = parseInt(options.goods_num || 1);

			// 加载商品数据
			this.loadData();

			uni.$on('__event_choice_address', data => {
				this.addrData = data;
			});
		},
		onShow() {
			if (this.addrData && this.addrData._id) return;
			this.$db[_address].where('create_uid == $env.uid').tofirst({
					orderby: 'is_default desc'
				})
				.then(res => {
					console.log('res', res);
					if (res && res.code === 200) {
						this.addrData = res.datas;
					}
				})

		},
		methods: {
			// 加载数据
			loadData() {
				this.$func.usemall.call('integral/goodsDetail2Order', {
					goods_id: this.goods_id
				}).then(res => {
					if (res.code === 200) {
						this.goodsDatas = res.datas;
						this.calcTotalMoney();
						this.is_submit = 0;
						return;
					}

					this.$api.msg(res.msg);
				})
			},
			// 计算实际支付 总金额
			calcTotalMoney() {

				this.goods_money = 0;
				this.goodsDatas.forEach(x => {
					x.goods.goods_num = this.goods_num;
					
					this.goods_money += (x.goods.integral) * x.goods.goods_num;
				});

				this.total_money = this.goods_money;
			},
			// +- 下单数量
			numberChange(options) {
				let data = this.goodsDatas[options.index];
				data.goods.goods_num = options.number;

				if (this.goods_id) this.goods_num = options.number;
				
				this.calcTotalMoney();
			},
			// 提交订单
			submit() {
				if (!(this.addrData && this.addrData._id)) {
					this.$api.msg('请选择收货人');
					return;
				}
				
				uni.showModal({
					title: `支付${this.total_money}积分`,
					confirmText: '支付',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							
							if (this.is_submit) {
								this.$api.msg('提交中');
								return;
							}
							this.is_submit = 1;
							
							let _this = this;
							
							let obj = {
								sharemid: uni.getStorageSync('__use_share_mid') || '',
							
								goods_id: _this.goods_id,
								goods_num: _this.goods_num,
								
								addr_id: _this.addrData._id,
								order_from: _this.platform_name,
								order_desc: _this.order_desc
							};
							
							this.$func.usemall.call('integral/orderCreate', obj).then(res => {
								if (res.code === 200) {
									// todo 修改现有积分
									
									// 跳转-我的兑换页
									uni.redirectTo({
										url: '/sub-user/pages/integral/order'
									});
									return;
								}
							
								_this.$api.msg(res.msg);
								_this.$api.timerout(() => {
									_this.is_submit = 0;
								}, 800);
							})
						}
					}
				})

			},
			// 选择收货人
			toaddr() {
				uni.navigateTo({
					url: '/sub-user/pages/address/address?source=1'
				});
			},
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
		padding-bottom: 100rpx;
	}

	.goods-area {
		.goods-item {
			display: flex;
			
			.title {
				height: 72rpx;
			}

			.disabled {
				color: #fff !important;
				width: 70%;
				height: 70%;
				background-color: rgba(51, 51, 51, 0.5);
			}

			image {
				flex-shrink: 0;
				display: block;
				width: 180rpx;
				height: 180rpx;
				border-radius: 4rpx;
			}
		}
	}

	.oper-area {
		z-index: 998;
		box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
		height: 100rpx;
		height: calc(env(safe-area-inset-bottom) + 100upx);

		.submit {
			height: 66rpx;
		}
	}


</style>
