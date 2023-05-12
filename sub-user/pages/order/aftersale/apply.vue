<template>
	<view>
		<use-navbar title="订单售后"></use-navbar>
		
		<!-- 商品区 -->
		<view class="padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="goods-area" v-for="(item, index) in order_detail" :key="index">
				<view class="dflex">
					<view class="img">
						<image :src="item.goods_sku_img || item.goods_img" class="border-radius"></image>
					</view>
					<view class="margin-left-sm">
						<text class="clamp-2">{{ item.goods_name }} {{ item.goods_name_pw }}</text>
						<view class="ft-dark fs-xs padding-top-xs">
							<text class="margin-right">× {{ item.goods_num }}</text>
							{{ item.goods_sku_name || '&nbsp;&nbsp;' }}
						</view>
						<view class="margin-top-sm">
							<text class="price">{{ item.goods_price / 100 }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 退款区 -->
		<view v-if="'退款' == type" class="margin-lr padding-bottom-sm">
			<use-list-title title="货物状态" type="round" color="#333" :tip="goods_state" iconfont=" "
				@goto="openActionSheet(1)"></use-list-title>
		</view>
		
		<!-- 售后区 -->
		<view class="margin-lr padding-bottom-sm">
			<!-- 售后原因 -->
			<use-list-title :title="reasonTitle" type="round" color="#333" :tip="reason" iconfont=" "
				@goto="openActionSheet(2)"></use-list-title>
		</view>
		
		<view v-if="['退货', '换货'].includes(type)" class="margin-lr padding-bottom-sm">
			<use-list-title title="寄回方式" type="round" color="#333" :tip="return_way" iconfont=" "
				@goto="returnWayShow = true"></use-list-title>
		</view>

		<!-- 退货情况下 -->
		<view v-if="['退款', '退货'].includes(type)" class="refund-area padding margin-lr margin-bottom-sm bg-main border-radius">
			<view class="dflex-b">
				<text class="item margin-right-sm">退款方式</text>
				<view class="dflex">
					<text class="ft-dark margin-right-xs">{{refund_way}}</text>
				</view>
			</view>
			<view class="dflex-b">
				<text class="item margin-right-sm">退款金额</text>
				<text class="price">{{refund_amount / 100}}</text>
			</view>
		</view>
		
		<!-- 上传凭证 -->
		<view class="padding margin-lr margin-tb-sm bg-main border-radius">
			<!-- 售后说明 -->
			<textarea v-model="desc" style="height: 100px;" class="ft-black w-full margin-0 padding-0 fs-sm"
				:placeholder="descPlaceholder"></textarea>

			<!-- 上传图片 -->
			<use-upload desc="上传凭证" class="pos-r" @upload="refundImgs"></use-upload>
		</view>

		<!-- 换货情况下 -->
		<view v-if="type == '换货'" class="margin-lr">
			<view class="dflex-b">
				<text class="item margin-top-sm margin-lr-sm">收货地址</text>
				<text class="ft-dark"></text>
			</view>
			<view class="use-area dflex-b" @click="toaddr">
				<view class="dflex">
					<view class="iconfont icondizhi- margin-right ft-main"></view>
					<view class="w-full dflex-wrap-w">
						<view class="margin-bottom-xs clamp-2">
							<text>{{ addrData.addr }} {{ addrData.addr_detail }}</text>
						</view>
						<view>
							<text>{{ addrData.consignee }}</text>
							<text class="margin-left">{{ addrData.mobile }}</text>
						</view>
					</view>
				</view>
			
				<view class="iconfont iconjiantou-01 fs-sm"></view>
			</view>
		</view>
		
		<!-- 提交操作 -->
		<view class="padding w-full margin-top">
			<view class="dflex-b border-radius-big">
				<view class="tac padding-tb-sm flex1 bg-base" @click="submit">提交申请</view>
			</view>
		</view>
		
		<!-- 寄回方式说明 -->
		<use-popup v-model="returnWayShow" bgclass=" " mode="bottom">
			<view class="padding bg-main border-radius-top30" style="max-height: 65vh; min-height: 40vh;">
				<view class="dflex-c padding-lr padding-tb-sm">寄回方式 - 自行寄回</view>
				
				<view class="fwb fs-30 padding">
					<view>
						1. {{type}}申请商家同意后将{{type}}商品快递到指定售后地址
					</view>
					<view class="margin-top-xs">
						2. {{type}}售后地址在 我的->退款/售后 售后详情中查看、复制
					</view>
				</view>
				
				<view class="dflex-c margin-top-xl">
					<view class="dflex-b border-radius-big" style="width: 50vw;">
						<view class="tac padding-tb-sm flex1 bg-base" @click="returnWayShow = false">确定</view>
					</view>
				</view>
				
				<view class="w-full safe-area-inset-bottom" style="height: 60rpx;"></view>
			</view>
		</use-popup>
	
		<!-- 用云版权 -->
		<use-copyright></use-copyright>

		<!-- 操作菜单 -->
		<use-action-sheet v-model="actionSheetShow" :list="actionSheetList" :tips="actionSheetTips"
			@click="actionSheetClick" @close="actionSheetClose"></use-action-sheet>
	</view>
</template>

<script>
	export default {
		computed: {
			reasonTitle() {
				return `${this.type}原因`;
			},
			descPlaceholder() {
				return `请填写${this.type}说明`;
			}
		},
		data() {
			return {
				// 1退款 2退货 3换货
				type: '售后',
				isubmit: false,
				
				goods_state: '请选择',
				reason: '请选择',
				
				desc: '', // 退款说明
				// 订单ID
				order_id: '',
				// 商品ID
				goods_id: '',
				// 商品SKU ID
				goods_sku_id: '',
				
				refund_way: '原支付退回',
				refund_amount: 0,
				
				return_way: '自行寄回',
				// 换货地址
				exchange_addr: {},
				
				// 商品数据
				order_detail: [],
				// 订单数据
				order_data: {},

				postData: {
					order_id: '',
					goods_state: '',
					reason: '',
					desc: '',
					imgs: [],
					refund_amount: 0,
				},

				actionSheetShow: false,
				actionSheetList: [],
				actionSheetTips: {
					text: "售后申请",
					color: "#9a9a9a",
					size: 24
				},
				addrData: {},
				returnWayShow: false
			};
		},
		onUnload() {
			uni.$emit('__event_order', 'refresh');
		},
		onLoad(res) {
			console.log('this res', res);
			
			// 1退款 2退货 3换货
			switch (res.type){
				case '1':
					this.type = '退款';
					break;
				case '2':
					this.type = '退货';
					break;
				case '3':
					this.type = '换货';
					break;
				default:
					this.$api.msg('售后类型不存在');
					break;
			}
			
			uni.setNavigationBarTitle({
				title: `申请售后 - ${ this.type }`
			});
			
			this.order_id = res.order_id;
			this.goods_id = res.goods_id || '';
			this.goods_sku_id = res.goods_sku_id || '';
			
			if (!this.order_id) {
				this.$api.msg('订单编号不存在');
				return;
			}
			
			uni.$on('__event_choice_address', data => {
				this.addrData = {
					consignee: data.consignee,
					mobile: data.mobile,
					addr: data.address,
					addr_detail: data.addr_detail
				} 
			});
			this.loadData();
		},
		methods: {
			loadData() {
				this.$func.usemall.call('order/detail', {
					order_id: this.order_id,
					goods_id: this.goods_id,
					goods_sku_id: this.goods_sku_id,
				}).then(res => {
					if (res.code === 200) {
						
						switch (res.datas.order.order_pay_way){
							case '微信支付':
								this.refund_way = '退回微信零钱';
								break;
							case '零钱支付':
								this.refund_way = '退回我的余额';
								break;
							default:
								break;
						}
						
						// 退款金额为实付款金额
						let refund_amount = 0;
						res.datas.order_detail.forEach(x => {
							if (!x.goods_amount) {
								x.goods_amount = x.goods_price * x.goods_num;
							}
							
							refund_amount += x.goods_amount;
						});
						
						this.refund_amount = refund_amount;
						
						this.order_data = res.datas.order;
						this.order_detail = res.datas.order_detail;
						
						
						// 收货地址
						if (this.type == '换货') {
							this.addrData = {
								consignee: res.datas.order.order_consignee,
								mobile: res.datas.order.order_consignee_tel,
								addr: res.datas.order.order_consignee_addr,
								addr_detail: res.datas.order.order_consignee_addr_detail
							} 
						}
					}
				})
			},
			// 选择收货人
			toaddr() {
				uni.navigateTo({
					url: '/sub-user/pages/address/address?source=1',
					complete() {}
				});
			},
			refundImgs(options) {
				let imgs = [];

				options.forEach((_) => {
					imgs.push(_.url);
				});

				if (imgs.length > 0) this.postData.imgs = imgs;

				console.log('refundImgs', this.postData.imgs);
			},
			submit() {
				if (this.type == '退款' && !this.postData.goods_state) {
					this.$api.msg(`请选择货物状态`);
					return;
				}
				
				if (!this.postData.reason) {
					this.$api.msg(`请选择${this.reasonTitle}`);
					return;
				}
				
				if (this.postData.reason === '其他' && !this.desc) {
					this.$api.msg(`请输入${this.type}说明`);
					return;
				}
				
				if (this.type == '换货' && !(this.addrData && this.addrData.addr)) {
					this.$api.msg(`请选择收货地址`);
					return;
				}

				if (this.isubmit) return;
				this.isubmit = true;

				uni.showModal({
					title: '提示',
					content: `申请${this.type}`,
					success: (res) => {
						if (res.confirm) { 
							this.postData.order_id = this.order_id;
							this.postData.goods_id = this.goods_id;
							this.postData.goods_sku_id = this.goods_sku_id;
							this.postData.refund_way = this.refund_way;
							this.postData.refund_amount = this.refund_amount;
							this.postData.return_way = this.return_way;
							this.postData.exchange_addr = this.addrData;
							this.postData.desc = this.desc;
							this.postData.type = this.type;
							
							console.log('this.postData', this.postData);
							// this.isubmit = false;
							// return;
							
							// 申请并提交
							this.$func.usemall.call('orderaftersale/applySubmit', this.postData).then(res => {
								this.isubmit = false;
								if (res.code === 200) {
									this.$api.msg('提交成功');
									//setTimeout(() => {
									this.$api.back();
									//}, 1000);
									return;
								}
								this.$api.msg(res.msg);
							});
							return;
						} 
						
						this.isubmit = false;
					}
				});

			},
			// 打开操作菜单
			openActionSheet(idx) {

				let type = '';
				let actionSheetList = [];

				switch (idx) {
					case 1:
						type = "货物状态";
						this.actionSheetTips.text = "请选择" + type;
						actionSheetList = [{
							text: "已收到货",
							color: "#333",
							type: type
						}, {
							text: "未收到货",
							color: "#333",
							type: type
						}, ];

						break;
					case 2:
						type = this.reasonTitle;
						this.actionSheetTips.text = "请选择" + type;
						
						if (this.type == '退款') {
							actionSheetList = [{
								text: "未发货不要了",
								color: "#333",
								type: type
							}, {
								text: "拍错了，重新下单",
								color: "#333",
								type: type
							}, {
								text: "换一家，重新购买",
								color: "#333",
								type: type
							}, {
								text: "其他",
								color: "#333",
								type: type
							}];
							break;
						}
						
						if (this.type == '退货') {
							actionSheetList = [{
								text: "7天无理由",
								color: "#333",
								type: type
							}, {
								text: "商品质量/故障问题",
								color: "#333",
								type: type
							}, {
								text: "商品破损/包装问题",
								color: "#333",
								type: type
							}, {
								text: "少件/发错货/未收到货",
								color: "#333",
								type: type
							}, {
								text: "实物与商品描述不相符",
								color: "#333",
								type: type
							}, {
								text: "其他",
								color: "#333",
								type: type
							}];
							break;
						}
						
						if (this.type == '换货') {
							actionSheetList = [{
								text: "商品质量/故障问题",
								color: "#333",
								type: type
							}, {
								text: "商品破损/包装问题",
								color: "#333",
								type: type
							}, {
								text: "少件/发错货/未收到货",
								color: "#333",
								type: type
							}, {
								text: "实物与商品描述不相符",
								color: "#333",
								type: type
							}, {
								text: "其他",
								color: "#333",
								type: type
							}];
							break;
						}
						break;
				}

				this.actionSheetShow = true;
				this.actionSheetList = actionSheetList;
			},
			// 关闭操作菜单
			actionSheetClose() {
				console.log(this.actionSheetShow);
			},
			// 点击操作菜单
			actionSheetClick(index) {
				let item = this.actionSheetList[index];
				
				switch (item.type) {
					case '货物状态':
						this.goods_state = item.text;
						this.postData.goods_state = item.text;
						break;
					default:
						this.reason = item.text;
						this.postData.reason = item.text;
						break;
				}
			},
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

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

	/* 退款区 */
	.refund-area {
		line-height: 60rpx;

		.desc {
			line-height: 60rpx;
		}
	}
</style>
