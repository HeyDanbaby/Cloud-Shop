<template>
	<view class="padding-sm">
		<use-navbar ref="navbar" title="积分商城"></use-navbar>
		
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
					<view class="image-wrapper"><image mode="widthFix" class="border-radius-sm" lazy-load :src="item.img"></image></view>
					
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
					<view class="image-wrapper"><image mode="widthFix" class="border-radius-sm" lazy-load :src="item.img"></image></view>
					
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
				goodsRightDatas: []
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
		onLoad() {},
		onShow() {
			this.loadData();
		},
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
						return;
					}
				});

				this.loadGoodsData();
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
		width: 100%;
		height: 320rpx;
		overflow: hidden;
	
		image {
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	}
	
	.stats-area .item,
	.order-area .item {
		position: relative;
		flex: 1;
	}
</style>
