<template>
	<view class="margin-sm">
		<use-navbar title="创建订单"></use-navbar>
		
		<view v-if="type == 'group' && groupData && groupData._id" class="use-area margin-bottom-sm overflow-hidden pos-r">
			<view class="dflex-b ft-base pos-a pos-t-full padding-tb-sm padding-lr" style="background-color: #f5e7e6;" @click.stop="toGroupNotice">
				<block v-if="groupChiefData && groupChiefData._id">
					<text v-if="groupUnMemberCnt">{{groupData.group_num}}人团，还差{{groupUnMemberCnt}}人成团</text>
					<text v-else>{{groupData.group_num}}人团，拼单已满员，请发起新的拼团</text>
				</block>
				<text v-else>开团支付后，还差{{groupData.group_num - 1}}人成团</text>
				<view class="dflex">
					<text>攻略</text>
					<view class="iconfont iconjiantou-01 fs-sm ft-base"></view>
				</view>
			</view>
			<view class="padding-lg w-full"></view>
			
			<view class="dflex" style="align-items: flex-start;">
				<view v-for="(item, idx) in groupData.members" :key="idx" class="margin-right-xl dflex-c dflex-flow-c pos-r">
					<view class="pos-r dflex-c group-user">
						<image v-if="item.uheadimg" mode="aspectFit" class="headimg image-sm border-radius-c" :src="item.uheadimg"></image>
						<view v-else class="headimg image-sm border-radius-c dflex-c">
							<text class="iconfont iconchangjianwenti-01 fs-xxl line-height-1 ft-dark"></text>
						</view>
						
						<view v-if="groupChiefData && groupChiefData._id && item.state" class="fs-xxs pos-a pos-bottom line-height-1 border-radius-xs scale-09" 
							style="bottom: -10rpx; padding: 4rpx 6rpx; transform-origin: center;"
							:class="[ idx == 0 ? 'bg-base' : 'bg-trans' ]">{{ idx == 0 ? '团长' : item.state }}</view>
					</view>
					
					<view class="fs-xs margin-top-xs" :class="[ item.uid ? 'ft-base' : 'ft-dark' ]">{{item.uname}}</view>
				</view>
			</view>
		</view>
		
		<view v-if="['group', 'seckill'].includes(type)" class="use-area dflex ft-base margin-t0"
			style="background: #f5e7e6; padding: 26rpx 30rpx;">
			<view class="bg-warn ft-white border-radius-lg fs-xxs margin-right-xs" style="padding: 2rpx 16rpx">限时{{type=='group'? '拼团' : '秒杀'}}</view>
			
			<view class="dflex">
				<text>距{{ type=='group'? groupChiefData && groupChiefData._id ? '拼单' : '拼团' : '秒杀' }}结束还剩</text>
				<use-count-down
					ref="uCountDown"
					fontSize="28"
					separatorSize="24"
					color="#ff6a6c"
					bgColor="rgba(0,0,0,0)"
					:showDays="true"
					separatorColor="#ff6a6c"
					:timestamp="expiresTime"
					@end="removeData"
					></use-count-down>
			</view>
		</view>
		<block v-else>
		<view v-if="member.vip" class="use-area dflex-b fwb ft-base margin-t0" style="background: #f5e7e6;" @click="toMember">
			<view>{{appabbr}}VIP，尊享会员价权益</view>
			<view class="iconfont iconjiantou-01 fs-sm ft-dark"></view>
		</view>
		<view v-if="!member.vip" class="use-area dflex-b fwb ft-base margin-t0" style="background: #f5e7e6;" @click="toMember">
			<view>￥{{member_setting.vip_fees || '-'}}元开通年VIP会员，尊享5大权益</view>
			<view class="iconfont iconjiantou-01 fs-sm ft-dark"></view>
		</view>
		</block>
		
		<!-- 收货人 -->
		<view v-if="!(addrData && addrData._id)" class="margin-top-sm">
			<use-list-title type="round" color="#333" title="选择收货人" iconfont="icondizhi-" @goto="toaddr"></use-list-title>
		</view>
		<view v-else class="use-area dflex-b" @click="toaddr">
			<view class="dflex">
				<view class="iconfont icondizhi- margin-right ft-main"></view>
				<view class="w-full dflex-wrap-w">
					<view class="margin-bottom-xs clamp-2">
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
			<view v-for="(item, idx) in goodsDatas" :key="idx" class="goods-item" :class="{ 'margin-top': idx > 0 }">
				<view class="pos-r">
					<image mode="aspectFill" :src="item.goods.img" class="dflex-c border-radius-sm"></image>
					<view v-if="!item.goods.iDelivery"
						class="disabled dflex-c dflex-flow-c pos-a pos-tl-c border-radius-c">
						<text class="fs-xs">收货地址</text>
						<text class="fs-xxs">超配送范围</text>
					</view>
					<view v-else-if="(item.goods.stock_num < 10 || item.goods.stock_num < item.goods.goods_num)"
						class="disabled dflex-c dflex-flow-c pos-a pos-tl-c border-radius-c">
						<text class="fs-xs">库存预警</text>
						<text class="fs-xxs" v-if="item.goods.stock_num > 0">剩余{{item.goods.stock_num}}</text>
					</view>
					
					<view v-if="item.goods.price_tag" class="use-tag pos-a pos-top bg-base margin-right-sm">{{item.goods.price_tag}}</view>
				</view>
				<view class="flex1 padding-left-sm">
					<view class="dflex">
						<text class="title clamp-2">{{ item.goods.name || '' }} {{ item.goods.name_pw || '' }}</text>
					</view>
					<view class="ft-dark fs-xs padding-top-xs clamp-2">
						<text v-if="cart_ids && cart_ids.length > 0" class="margin-right-sm">× {{item.cart.goods_num}}</text>
						{{ (item.goods_sku && item.goods_sku.spec) || '&nbsp;&nbsp;' }}
					</view>
					<view class="pos-r dflex-b padding-top">
						<view class="dflex">
							<view class="price flex1">{{ item.goods.price / 100 }}</view>
						</view>
						
						<text v-if="groupData && groupData._id"
							class="border-radius-left50 fs-xxs bg-base line-height-1 margin-right-xs" 
							style="padding: 16rpx 20rpx;">{{groupData.group_num}}人团</text>
						<!-- + - 数量 -->
						<use-number-box v-else-if="!(cart_ids && cart_ids.length)" :min="1" :max="item.goods.limit || item.goods.stock_num"
							:value="item.goods.goods_num > item.goods.stock_num ? item.goods.stock_num : item.goods.goods_num"
							:is-max="item.goods.goods_num >= (item.goods.limit || item.goods.stock_num)" :is-min="item.goods.goods_num === 1"
							:disabled="item.goods.goods_num >= (item.goods.limit || item.goods.stock_num)"
							:index="idx" direction="right" @eventChange="numberChange"></use-number-box>
					</view>
				</view>
			</view>
		</view>
		
		<view v-if="!type" class="gap"></view>
		<!-- 非活动类，可选择优惠券 -->
		<use-list-title v-if="!type" title="优惠券" type="round" :tip="couponName" color="#333" iconfont="iconyouhui" @goto="couponShow = true"></use-list-title>
		<!-- 优惠券弹出层 -->
		<use-popup mode="bottom" bgclass=" " close-icon v-model="couponShow" @open="couponOpen">
			<!-- 优惠券区 -->
			<view class="coupon-area padding bg-drak border-radius-top30 safe-area-inset-bottom">
				<view class="tac fwbd w-full padding-lr  padding-top-xs padding-bottom fs-34">优惠券</view>
				<scroll-view scroll-y style="min-height: 40vh; max-height: 70vh;">
					<view v-for="(item, idx) in couponDatas" :key="idx" class="coupon-item bg-main pos-r fs-xs border-radius">
						<view class="content pos-r padding dflex-b">
							<view class="">
								<view class="margin-bottom-xs fs">{{ item.name }}</view>
								<view class="ft-dark">有效期至 {{ $api.format(item.end_time, 'yyyy-MM-dd') }}</view>
							</view>
							<view class="tar">
								<view v-if="item.type == '满减'" :class="item.usable ? '' : 'ft-dark'" class="margin-bottom-xs price">{{ item.price }}</view>
								<view v-if="item.type == '折扣'" :class="item.usable ? '' : 'ft-dark'" class="margin-bottom-xs discount">{{ item.price }}</view>
								<view v-if="item.order_amount > 0" class="ft-dark">满{{ item.order_amount }}可用</view>
								<view v-else class="ft-dark">不限</view>
							</view>
			
							<view class="circle l"></view>
							<view class="circle r"></view>
						</view>
						<view class="dflex-b">
							<text class="ft-dark padding-lr">{{ item.type }}</text>
							<text v-if="item.usable" class="ft-base padding-tb-sm padding-lr" @click="couponUse(item)">{{ item._id == order_coupon_id ? '不使用此券' : '立即使用' }}</text>
							<text v-else class="ft-dark padding-tb-sm padding-lr">不可使用</text>
						</view>
					</view>
					
					<view v-if="!(couponDatas && couponDatas.length > 0)" class="coupon-none">
						<text class="coupon-none-tip">无可用优惠券</text>
					</view>
				</scroll-view>
			</view>
				
		</use-popup>

		<view v-if="integral" class="use-area dflex-b" @click="toIntegralContent">
			<view class="dflex">
				<text class="iconfont iconyixiaoshou margin-right-sm line-height-0"></text>
				<text class="fs-xs">购买可得<text class="ft-base">{{integral}}</text>积分</text>
			</view>
			<view class="iconfont iconjiantou-01 fs-sm ft-dark"></view>
		</view>
		
		<!-- 金额明细 -->
		<view class="use-area">
			<view class="dflex-b line-height-item">
				<view class="flex1">总金额</view>
				<view class=""><text style="font-size: 24rpx;">￥</text>{{ goods_money }}</view>
			</view>
			<view class="dflex-b line-height-item">
				<view class="flex1">快递费</view>
				<view class=""><text style="font-size: 24rpx;">￥</text>{{ express_fee }}</view>
			</view>
			<view v-if="!type" class="dflex-b line-height-item">
				<view class="flex1">优惠金额</view>
				<view class="ft-base">-￥{{ total_coupon_money }}</view>
			</view>
		</view>

		<view class="use-area">
			<view class="margin-right-xl">备注</view>
			<textarea class="bg-drak w-full border-radius-sm margin-top-sm padding" style="min-height: 70px;"
				v-model="order_desc" maxlength="200" auto-height placeholder="请填写买家备注"></textarea>
		</view>

		<view class="gap"></view>

		<!-- 底部  -->
		<view class="oper-area pos-f pos-b-full w-full dflex-b bg-main safe-area-inset-bottom padding-lr-sm">
			<view>
				<text class="fs-sm">实付款</text>
				<text class="price margin-left-sm fs-xl">{{ total_money }}</text>
			</view>
			<view class="submit dflex-c border-radius-big padding-lr animated-all" 
				:class="isubmit ? 'use-loading' : 'bg-base'" @click="toSubmit">{{ !isubmit ? '提交订单' : '' }}</view>
		</view>
		
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
	import { mapState } from 'vuex';
	
	// 收获人地址
	const _address = 'usemall-member-address'
	export default {
		computed: {
			...mapState(['islogin', 'member']),
			integral() {
				if (!this.integral_setting || this.integral_setting.return_integral_ratio <= 0) {
					return 0;
				}
				
				let integral = parseInt(this.total_money * (this.integral_setting.return_integral_ratio));
				if (this.member.vip && this.member_setting && this.member_setting.vip_integral_mul > 0) {
					integral *= this.member_setting.vip_integral_mul;
				}
				
				return integral;
			},
			appabbr() {
				return this.$config.appabbr;
			}
		},
		data() {
			return {
				// 收货地址
				addrData: {},
				// 商品数据
				goodsDatas: [],
				// 产品金额
				goods_money: 0,

				// 优惠券
				couponShow: false,
				couponName: '选择优惠券',
				couponDatas: [],
				// 优惠券类型 满减|折扣
				coupon_type: '满减',
				// 优惠券金额
				coupon_money: 0,
				// 实付金额
				total_money: 0,
				// 优惠金额
				total_coupon_money: 0,
				// 快递费
				express_fee: 0,

				// 购物车 ids
				cart_ids: [],
				// 商品 id
				goods_id: 0,
				// 商品数量
				goods_num: 1,
				// 商品 sku id
				goods_sku_id: '',
				// 使用优惠券ID
				order_coupon_id: '',
				// 买家备注
				order_desc: '',

				isubmit: 1,
				platform: '',
				platform_name: '',
				
				member_setting: {},
				integral_setting: {},
				ids: [],
				
				// 类型
				// group 拼团
				// seckill 秒杀
				type: '',
				// 秒杀ID
				seckill_id: '',
				seckillData: {},
				// 拼团ID
				group_id: '',
				groupData: {},
				// 团长ID
				group_chief_id: '',
				groupChiefData: {},
				expiresTime: 0,
				groupUnMemberCnt: 0,
				
				groupNoticeShow: false,
				groupNotice: '',
				// 快递费数据
				expressDatas: []
			};
		},
		onLoad(options) {
			this.$api.get_env(res => {
				this.platform = res.platform;
				this.platform_name = res.platform_name;
			});
			
			this.seckill_id = options.seckill_id || '';
			this.group_id = options.group_id || '';
			this.group_chief_id = options.group_chief_id || '';
			if (this.seckill_id) this.type = 'seckill';
			if (this.group_id) this.type = 'group';
			// 剩余时间
			this.expiresTime = options.expires_time || 0;
			
			// 商品 ids
			this.goods_id = options.goods_id || '';
			// 商品数量 
			this.goods_num = parseInt(options.goods_num || 1);
			// 商品 sku
			this.goods_sku_id = options.sku_id || '';

			// 购物车 ids
			if (options.cart_ids) {
				this.cart_ids = options.cart_ids.split(',');
			}
			// 加载商品数据
			this.loadData();

			uni.$on('__event_choice_address', data => {
				this.addrData = data;
				this.calcTotalMoney();
			});
		},
		onShow() {
			if (this.addrData && this.addrData._id) return;
			this.$db[_address].where(`create_uid == "${this.member._id}"`).tofirst({
					orderby: 'is_default desc'
				})
				.then(res => {
					console.log('res', res);
					if (res && res.code === 200) {
						this.addrData = res.datas;
						this.calcTotalMoney();
					}
				})

		},
		methods: {
			// 加载数据
			loadData() {
				this.$func.usemall.call('goods/detail2order', {
					cart_ids: this.cart_ids,
					goods_id: this.goods_id,
					goods_sku_id: this.goods_sku_id,
					seckill_id: this.seckill_id,
					group_id: this.group_id,
					group_chief_id: this.group_chief_id
				}).then(res => {
					console.log('detail2order res', res);
					if (res.code === 200) {
						this.ids = res.datas.map(x => x.goods._id);
						
						this.seckillData = res.result.seckill || {};
						this.groupData = res.result.group || {};
						this.groupChiefData = res.result.group_chief || {};
						this.expressDatas = res.result.express_fees || [];
						
						if (this.seckillData && this.seckillData._id) {
							// 秒杀剩余时间
							this.expiresTime = this.seckillData.expires_time;
							if (this.expiresTime <= 0) this.removeData();
						}
						
						if (this.groupData && this.groupData._id) {
							this.groupData.members = [];
							if (this.groupChiefData && this.groupChiefData._id) {
								// 参团剩余时间
								this.expiresTime = this.groupChiefData.expires_time;
								this.groupData.members = this.groupChiefData.group_members;
								this.groupUnMemberCnt = this.groupData.group_num - this.groupChiefData.group_members.length;
								for (let i = 0; i < this.groupUnMemberCnt; i++) {
									this.groupData.members.push({
										uname: '待参团',
										uheadimg: i == 0 ? this.member.member_headimg : ''
									});
								}
							} else {
								// 拼团剩余时间
								this.expiresTime = this.groupData.expires_time;
								for (let i = 0; i < this.groupData.group_num; i++) {
									if (i == 0) {
										this.groupData.members.push({
											uid: this.member._id,
											uname: '团长',
											uheadimg: this.member.member_headimg
										})
										continue;
									}
									
									this.groupData.members.push({
										uname: '待参团',
										uheadimg: ''
									})
								}
							}
							
							if (this.expiresTime <= 0) this.removeData();
						} 
						
						console.log('this.seckillData', this.seckillData, this.groupData, this.expiresTime);
						
						res.datas.forEach(x => {
							// 可配送
							x.goods.iDelivery = true;
							// 快递费
							x.goods.express_fee = 0;
							
							x.goods.vip = x.goods.is_vip === '是';
							
							if (this.seckillData && this.seckillData._id) {
								x.goods.limit = this.seckillData.goods_obj.limit;
							}
							if (this.groupData && this.groupData._id) {
								x.goods.limit = 1;
								// x.goods.limit = this.groupData.goods_obj.limit;
							}
							
							x.goods.price = this.getGoodsPrice(x);
							x.goods.price_tag = this.getGoodsPriceTag(x);
						});
						
						this.goodsDatas = res.datas;
						
						this.member_setting = res.result.member_setting || {};
						this.integral_setting = res.result.integral_setting || {};
						
						this.calcTotalMoney();
						this.isubmit = 0;
						return;
					}

					this.$api.msg(res.msg);
				})
			},
			// 加载快递费数据
			loadExpressData() {
				// 根据收货地址、已购买商品查询对应的快递费
				const addrPro = this.addrData.province_name;
				if (!addrPro) return;
				
				let expressFee = 0;
				
				for (var i = 0; i < this.expressDatas.length; i++) {
					const expressData = this.expressDatas[i];
					console.log('this.goodsDatas', this.goodsDatas, expressData);
					const goodsFreightDatas = this.goodsDatas.filter(g => g.goods.freight_tpl == expressData._id);
					if (!(goodsFreightDatas && goodsFreightDatas.length)) {
						console.log('商品包邮，未配置快递费模板');
						continue;
					}
					
					for (var j = 0; j < goodsFreightDatas.length; j++) {
						// 修改商品配送费、配送状态
						const goodsData = goodsFreightDatas[j];
						
						// 查询对应的 配送省份 数据
						const feeObj = expressData.areas.find(x => x.areas.includes(addrPro));
						if (!feeObj) {
							// 当前商品不可配送 - 收货地址省份
							goodsData.goods.iDelivery = false;
							continue;
						} 
						
						// 当前商品可配送 - 收货地址省份
						goodsData.goods.iDelivery = true;
						
						// 首重
						// 首重费用
						expressFee += feeObj.first_fee;
						// 首重费用
						goodsData.goods.express_fee = feeObj.first_fee;
						
						// 商品重量
						const goodsWeight = goodsData.goods.weight * goodsData.goods.goods_num;
						// 商品重量小于等于 首重
						if (goodsWeight <= feeObj.first_weight) {
							continue;
						}
						
						// 续重
						const goodsContinueWeight = goodsWeight - feeObj.first_weight;
						// 续重费用 = 续重费用 * 超过续重重量的倍数（向上取整）
						const goodsContinueFee = feeObj.continue_fee * Math.ceil(goodsContinueWeight / feeObj.continue_weight);
						// 续重费用
						expressFee += goodsContinueFee;
						// 续重费用
						goodsData.goods.express_fee += goodsContinueFee;
					}
				}
				
				this.express_fee = (expressFee / 100).toFixed(2);
			},
			getGoodsPrice(res) {
				// 拼团价
				if (this.type && this.group_id) {
					if (this.groupData && this.groupData.goods_obj) {
						return this.groupData.goods_price;
					}
					return 0;
				} 
				
				// 秒杀价
				if (this.type && this.seckill_id) {
					if (this.seckillData && this.seckillData.goods_obj) {
						return this.seckillData.goods_obj.price;
					}
					return 0;
				}
				
				console.log('getGoodsPrice res', res);
				// 会员价
				if (this.member.vip && res.goods.vip) return res.goods.vip_price;
				
				return res.goods.price || 0;
			},
			getGoodsPriceTag(res) {
				if (['group', 'seckill'].includes(this.type)) {
					return this.type == 'group' ? '拼团价' : this.type == 'seckill' ? '秒杀价' : '';
				}
				if (this.member.vip && res.goods.vip) {
					return '会员价';
				}
				return '';
			},
			// 计算实际支付 总金额
			calcTotalMoney() {
				// 服务项总金额
				let service_money = 0;

				this.goods_money = 0;
				this.goodsDatas.forEach(x => {
					if (x.goods_sku) {
						x.goods.weight = x.goods_sku.weight || 0;
					}
					
					if (x.goods_sku && x.goods_sku.price) {
						x.goods.price = x.goods_sku.price;
						
						if (this.member.vip && x.goods.is_vip === '是' && x.goods_sku.vip_price) { 
							x.goods.price = x.goods_sku.vip_price || x.goods.price; 
						} else {
							x.goods.is_vip = '否'; 
						}
						
						x.goods.stock_num = x.goods_sku.stock_num;
						x.goods_sku.spec = [x.goods_sku.sku1_spec,x.goods_sku.sku2_spec,x.goods_sku.sku3_spec,x.goods_sku.sku4_spec].filter(s => s).join(' & ');
						if (x.goods_sku.img) x.goods.img = x.goods_sku.img;
					}
					
					x.goods.goods_num = this.goods_num;
					if (x.cart && x.cart.goods_num) {
						x.goods.goods_num = x.cart.goods_num;
					}
				});
				
				// 加上快递费
				this.loadExpressData();
				service_money += parseFloat(this.express_fee);
				
				// 商品金额
				this.goodsDatas.forEach(x => {
					// 可配送
					if (x.goods.iDelivery) {
						this.goods_money += (x.goods.price / 100) * x.goods.goods_num;
					}
				});
				// 防止精度丢失
				this.goods_money = this.$api.format_float(this.goods_money);

				// 商品金额 + 服务金额 - 优惠金额
				if (this.coupon_type == '满减') {
					this.total_coupon_money = this.coupon_money;
					this.total_money = (this.goods_money + service_money - this.coupon_money).toFixed(2);
				} else if (this.coupon_type == '折扣') {
					this.total_coupon_money = ((this.goods_money + service_money) - ((this.goods_money + service_money) * this.coupon_money)).toFixed(2);
					this.total_money = ((this.goods_money + service_money) * this.coupon_money).toFixed(2);
				} else {
					this.total_coupon_money = 0;
					this.total_money = (this.goods_money + service_money).toFixed(2);
				}
			},
			// +- 下单数量
			numberChange(options) {
				let data = this.goodsDatas[options.index];
				data.goods.goods_num = options.number;

				if (this.goods_id) this.goods_num = options.number;

				this.calcTotalMoney();
			},
			// 打开优惠券
			couponOpen() {
				// 加载可使用优惠券数据 couponDatas
				this.$func.usemall.call('marketing/coupon/useOrder', {
					goods_ids: this.ids
				}).then(res => {
					if (res.code == 200) {
						res.datas.forEach(x => {
							switch (x.type){
								case '满减':
									x.price /= 100;
									x.usable = this.goods_money > x.price;
									break;
								case '折扣':
									x.price /= 100;
									x.usable = this.goods_money * x.price > 0;
									break;
								default:
									break;
							}
							
							if (x.order_amount && x.usable) {
								// 金额大于等于满减金额
								x.usable = this.goods_money >= x.order_amount;
							}
						});
						this.couponDatas = res.datas;
						return;
					}
					
					this.$api.msg(res.msg);
				})
			},
			// 使用优惠券
			couponUse(coupon) {
				
				if (this.order_coupon_id == coupon._id) {
					this.order_coupon_id = '';
					this.coupon_money = 0;
					this.coupon_type = '';
					this.couponName = '';
				} else {
					this.couponShow = false;
					this.order_coupon_id = coupon._id;
					this.coupon_money = coupon.price;
					this.coupon_type = coupon.type;
					this.couponName = coupon.name;
				}
				
				this.calcTotalMoney();
			},

			// 提交订单
			toSubmit() {
				if (this.groupChiefData && this.groupChiefData._id) {
					if (!this.groupUnMemberCnt) {
						// 已满员
						this.$api.msg('当前拼单已满员，请发起新的拼团');
						return;
					}
				}
				
				if (!(this.addrData && this.addrData._id)) {
					this.$api.msg('请选择收货人');
					return;
				}
				
				// 判断是否存在可配送商品
				if (!this.goodsDatas.find(x => x.goods.iDelivery)) {
					this.$api.msg('收货地址，无可配送商品');
					return;
				}

				if (this.isubmit) {
					this.$api.msg('提交中');
					return;
				}
				this.isubmit = 1;

				let obj = {
					cart_ids: this.cart_ids,
					sharemid: uni.getStorageSync('__use_share_mid') || '',

					goods_id: this.goods_id,
					goods_num: this.goods_num,
					goods_sku_id: this.goods_sku_id,

					order_coupon_id: this.order_coupon_id,
					order_integral: 0,
					order_use_integral: 0,
					addr_id: this.addrData._id,
					order_from: this.platform_name,
					order_desc: this.order_desc,
					
					seckill_id: this.seckill_id,
					group_id: this.group_id,
					group_chief_id: this.group_chief_id
				};

				// 'order/create'		// 无事务版本
				// 'order/createV2'		// 事务版本
				this.$func.usemall.call('order/createV2', obj).then(res => {
					if (res.code === 200) {
						// 跳转支付页
						this.$api.topay({
							order_id: res.datas.order_id,
							money: res.datas.money,
							type: 'redirect'
						});
						return;
					}

					this.$api.alert(res.msg);
					this.$api.timerout(() => {
						this.isubmit = 0;
					}, 800);
				})
			},
			// 选择收货人
			toaddr() {
				uni.navigateTo({
					url: '/sub-user/pages/address/address?source=1',
					complete() {}
				});
			},
			toMember() {
				if (this.member && this.member.vip) {
					uni.navigateTo({
						url: '/sub-user/pages/member/member'
					})
					return;
				}
				
				uni.navigateTo({
					url: '/sub-user/pages/member/member-not'
				})
			},
			toIntegralContent() {
				// 积分规则
				if (!(this.integral_setting && this.integral_setting.integral_desc)) return;
				
				const content = `<div class="__rich_text">${this.integral_setting.integral_desc.replace(/<h1/gi, '<h1 class="use-p"').replace(/<h3/gi, '<h3 class="use-p"').replace(/<p/gi, '<p class="use-p"')}</div>`;
				
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
			removeData(res) {
				if (this.groupChiefData && this.groupChiefData._id) {
					this.$api.alert(`拼单活动已结束`, () => {
						this.$api.back();
					});
					return;
				}
				if (this.groupData && this.groupData._id) {
					this.$api.alert(`拼团活动已结束`, () => {
						this.$api.back();
					});
					return;
				}
				if (this.seckillData && this.seckillData._id) {
					this.$api.alert(`秒杀活动已结束`, () => {
						this.$api.back();
					});
					return;
				}
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
		padding-bottom: 100rpx;
	}
	
	.group-user {
		.headimg {
			border: 1px solid #eaeaea;
		}
	}
	
	.goods-area {
		.goods-item {
			display: flex;

			.title {
				height: 72rpx;
			}

			.disabled {
				color: #fff !important;
				width: 160rpx;
				height: 160rpx;
				background-color: rgba(51, 51, 51, 0.5);
			}

			image {
				flex-shrink: 0;
				width: 180rpx;
				height: 180rpx;
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

	/* 优惠券区 */
	.coupon-area {
		overflow: auto;

		.coupon-item {
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.content {
				&:after {
					position: absolute;
					left: 0;
					bottom: 0;
					content: '';
					width: 100%;
					height: 0;
					border-bottom: 1px dashed #f3f3f3;
					transform: scaleY(50%);
				}
			}

			.circle {
				position: absolute;
				bottom: -10rpx;
				z-index: 10;
				width: 20rpx;
				height: 20rpx;
				background: #f5f5f5;
				border-radius: 50%;

				&.r {
					right: -6rpx;
				}

				&.l {
					left: -6rpx;
				}
			}
		}
	}

	.coupon-none {
		width: 100%;
		height: 100%;
		line-height: 30vh;
		display: flex;
		align-items: center;
		justify-content: center;

		.coupon-none-tip {
			color: #909399;
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
