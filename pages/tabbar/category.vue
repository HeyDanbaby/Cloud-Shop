<template>
	<view class="wh-full">
		<use-navbar title="分类"></use-navbar>
		
		<!-- 头部组件 -->
		<use-header :fixed="headerFixed" :placeholder="headerPlaceholder" type="gray" :search-tip="searchTip" :search-auto="searchAuto"></use-header>

		<!-- 分类 -->
		<view class="category dflex-s h-full padding-top-big">
			<!-- 左侧一级分类 -->
			<view class="h-full left padding-tb-16">
				<scroll-view scroll-y class="h-full">
					<view v-for="item in fdatas" :key="item._id" class="item dflex-c"
						:class="{ active: item._id === cid }" @click="fSelect(item)">{{ item.name }}</view>
				</scroll-view>
			</view>

			<!-- 右侧 1二级分类 2商品列表 -->
			<scroll-view class="h-full right" scroll-with-animation scroll-y :scroll-top="top"
				:style="{ height: scrollHeight, paddingLeft: 0 }" @scrolltolower="loadGoodsDatas('add')" @scroll="onScroll">
				
				<!-- 右侧二级分类 -->
				<view v-if="mode == 1" :class="{ 'padding-tb-sm': !categoryEmpty, 'padding-lr': !categoryEmpty }">
					<use-empty v-if="categoryEmpty" height="70vh" :btn-tip="false" e-style="round" tip="无分类数据"></use-empty>
					
					<!-- <view v-if="!categoryEmpty" class="bg-main border-radius margin-bottom-sm">
						<view class="fwbd fs-30 padding-tb padding-lr">猜你喜欢</view>
						<view class="dflex-s dflex-wrap-w">
							<view class="item padding-bottom dflex dflex-flow-c use-hover" v-for="item in sdatas.slice(0, 6)" :key="item._id" @click="togoodslist(item)">
								<image :lazy-load="true" :src="item.img"></image>
								<text class="tac clamp margin-top-sm">{{ item.name }}</text>
							</view>
						</view>
					</view> -->
					
					<view v-if="!categoryEmpty && sdatas.length > 0" class="bg-main border-radius margin-bottom-sm padding-top">
						<!-- <view class="fwbd fs-30 padding-tb-sm padding-lr">{{cname}}</view> -->
						<view class="dflex-s dflex-wrap-w">
							<view class="item padding-bottom dflex dflex-flow-c use-hover" v-for="item in sdatas" :key="item._id" @click="togoodslist(item)">
								<image :lazy-load="true" :src="item.img"></image>
								<text class="tac clamp margin-top-sm">{{ item.name }}</text>
							</view>
						</view>
					</view>
				</view>
				<!-- 右侧分类对应商品列表 -->
				<view v-if="mode == 2" :class="{ 'padding-tb-sm': !empty, 'padding-lr': !empty }">
					<!-- 空白页 -->
					<use-empty v-if="empty" height="70vh" :btn-tip="false" e-style="round" tip="无商品数据"></use-empty>

					<view v-else class="use-hover" v-for="(item, index) in goodsDatas" :key="index"
						@click="togoods(item)">
						<view class="goods border-radius padding margin-bottom-sm bg-main"
							style="padding-bottom: 15rpx;">
							<view class="goods-left pos-r">
								<image mode="aspectFill" class="border-radius-sm" lazy-load :src="item.img"></image>
								<view v-if="item.is_vip === '是'" class="use-tag pos-a pos-top bg-base scale-08" style="transform-origin: top left;">会员价</view>
							</view>
							<view class="margin-left-sm pos-r">
								<text class="clamp-2">{{ item.name }} {{ item.name_pw }}</text>
								<view class="pos-a price-box w-full">
									<text class="price">{{ item.is_vip === '是' ? item.vip_price / 100 : item.price / 100 }}</text>
									<text v-if="item.is_vip === '是' ? item.price / 100 : item.market_price / 100" class="m-price">{{ item.is_vip === '是' ? item.price / 100 : item.market_price / 100 }}</text>
									
								</view>
							</view>
						</view>
					</view>

					<!-- 上拉加载更多 -->
					<use-loadmore :type="loadmoreType"></use-loadmore>
				</view>
			</scroll-view>
			
			<!-- 置顶 -->
			<use-totop ref="usetop" type="tabbar" bottom="150" :top="10" :style="{ marginBottom: navHeight + 'px' }" @to="totop"></use-totop>
		</view>

		<!-- 切换模式 1二级分类 2商品列表 -->
		<view class="fixed-top" :style="{ marginBottom: navHeight + 'px' }" @click="changeMode">
			<text class="iconfont iconpailie" v-if="mode == 1"></text>
			<text class="iconfont iconpailie02" v-if="mode == 2"></text>
		</view>
	</view>
</template>

<script>
	const _goods = 'usemall-goods'
	const _goodscategory = 'usemall-goods-category'
	export default {
		data() {
			return {
				// 1分类列表 2商品列表
				mode: 2,
				// 兼容支付宝 height 显示 bug
				scrollHeight: '100%',

				// 头部参数
				headerPlaceholder: 0,
				headerFixed: !0,
				searchAuto: !0,
				searchTip: '请输入搜索关键字',

				// 当前选中分类ID
				cid: 0,
				cname: '',
				// 一级数据
				fdatas: [],
				// 二级数据
				sdatas: [],
				categoryDatas: [],
				categoryEmpty: false,

				// 商品列表
				goodsDatas: [],
				empty: false,
				hasmore: 0,
				loadmoreType: 'more',
				// 商品请求数据
				reqdata: {
					rows: 20,
					page: 1
				},

				top: 0,
				scrollTop: 0,
				navHeight: 0
			};
		},
		watch: {
			goodsDatas(e) {
				// 监听数据，呈现空白页
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			},
			sdatas(e) {
				// 监听数据，呈现空白页
				let empty = e.length === 0;
				if (this.categoryEmpty !== empty) {
					this.categoryEmpty = empty;
				}
			}
		},
		onPageScroll(e) {
			//this.scrollTop = e.scrollTop;
		},
		onLoad() {
			// #ifdef MP-ALIPAY
			this.scrollHeight = (this.$env.windowHeight - this.$env.sis.titleBarHeight) + 'px';
			// #endif

			// 获取存储的模式
			this.mode = uni.getStorageSync('category.mode') || 2;

			this.loadData(() => {
				if (this.mode == 2) {
					// 加载商品数据
					this.loadGoodsDatas()
				}
			});
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.loadData(() => {
				this.loadGoodsDatas('refresh');
				uni.stopPullDownRefresh();
			});
			
		},
		onTabItemTap(e) {
			console.log('tabitem tap', e);
			
			// uni.vibrateShort({
			//     success: function () {
			//         console.log('success');
			//     }
			// });
		},
		
		methods: {
			async loadData(callback) {
				this.$db[_goodscategory].where({ state: '启用' }).tolist({ rows: 200, orderby: 'sort asc' }).then(res => {
					if (res.code === 200) {
						this.fdatas = [];
						this.sdatas = [];
						this.categoryDatas = [];

						res.datas.forEach(item => {
							if (!item.pid) {
								// pid为父级id, 不存在 pid || pid=0 为一级分类
								this.fdatas.push(item);
							} else {
								this.categoryDatas.push(item);
								// 二级分类
								// this.sdatas.push(item);
							}
						});

						if (this.fdatas.length > 0) {
							this.cid = this.fdatas[0]._id;
							this.cname = this.fdatas[0].name;
							
							this.sdatas = this.categoryDatas.filter(x => x.pid == this.cid);
						}

						if (typeof callback === 'function') {
							// 数据加载完成回调函数
							callback();
						}
					}
				})
			},
			// 加载商品数据
			loadGoodsDatas(type = 'add') {
				if (this.mode != 2) {
					return;
				}
				
				
				if (this.loadmoreType === 'loading') {
					// 防止重复加载
					return;
				}
				
				if (type == 'refresh') {
					// 从首页开始加载
					this.reqdata.page = 1;
				}
				
				// 没有更多直接返回 
				if (type === 'add') {
					if (this.loadmoreType === 'nomore') {
						return;
					}
					// 加载中
					this.loadmoreType = 'loading';
				} else {
					// 更多
					this.loadmoreType = 'more'
				}
				
				// 根据当前 cid 加载商品数据列表
				this.reqdata.cid = this.cid;
				console.log('this.reqdata', this.reqdata);
				this.$db[_goods]
					.where(`state == "销售中"`)
					.where(`'${this.reqdata.cid}' in cids`)
					.tolist(this.reqdata)
					.then(res => {
						if (res.code === 200) {
							if (type == 'refresh') {
								this.goodsDatas = [];
							}
							
							if (res.datas && res.datas.length > 0) {
								let _datas = res.datas;
								this.goodsDatas = [...this.goodsDatas, ..._datas];
							
								if (res.datas.length >= this.reqdata.rows) {
									this.reqdata.page++;
									this.loadmoreType = 'more'
								} else {
									this.loadmoreType = 'nomore'
								}
							} else {
								this.loadmoreType = 'nomore'
							}
							
							this.empty = this.goodsDatas.length === 0;
						}
					})
			},
			totop(e) {
				this.top = e.scrollTop
				this.$nextTick(function() {
					this.top = 0
				});
			},
			// 一级分类
			fSelect(item) {
				this.cid = item._id;
				this.cname = item.name;
				
				this.sdatas = this.categoryDatas.filter(x => x.pid == this.cid);
				this.loadGoodsDatas('refresh');
			},
			// 切换模式 1分类模式 2商品模式
			changeMode() {
				this.mode = this.mode == 1 ? 2 : 1;
				uni.setStorage({
					key: 'category.mode',
					data: this.mode
				})

				this.loadGoodsDatas('refresh');
			},
			// 跳转商品详情
			togoods(item) {
				this.$api.togoods({
					id: item._id
				});
			},
			// 跳转商品列表
			togoodslist(item) {
				this.$api.togoodslist({
					cid: item._id
				});
			},
			onScroll(e) {
				this.$refs.usetop.change(e.detail.scrollTop);
			}
		},
		mounted() {
			// #ifdef H5 || MP-360
			this.navHeight = 50;
			// #endif
		}
	};
</script>

<style lang="scss">
	page {
		height: 100%;
		background-color: $page-color-base;
	}

	.category {
		overflow: hidden;

		.left {
			width: 180rpx;
			background-color: $page-color-base;

			.item {
				font-size: 28rpx;
				height: 100rpx;
				color: $font-color-base;
				position: relative;

				&.active {
					color: $uni-color-primary;
					font-size: 38rpx;
					font-weight: 580;
				}
			}
		}

		.right {
			flex: 1;
			overflow: hidden;
			display: block;

			.item {
				flex-shrink: 0;
				width: 33.33%;
				font-size: $font-sm + 2upx;
				color: #666;

				image {
					width: 130rpx;
					height: 130rpx;
				}
			}
		}
	}

	.goods {
		display: flex;

		.goods-left {
			image {
				width: 120rpx;
				height: 120rpx;
			}
		}

		.price-box {
			bottom: 0;
		}
	}
</style>
