<template>
	<view class="padding-top-big">
		<use-navbar ref="navbar" title="商品列表"></use-navbar>
		
		<!-- 筛选区 -->
		<view class="navbar pos-f w-full dflex bg-drak" :style="{ position: headerPosition, top: navbarHeight + 'px' }">
			<view class="nav-item dflex-c flex1 pos-r h-full" :class="{active: filterIndex === 0}"
				@click="navbarClick(0)">
				综合排序
			</view>
			<view class="nav-item dflex-c flex1 pos-r h-full" :class="{active: filterIndex === 1}"
				@click="navbarClick(1)">
				销量优先
			</view>
			<view class="nav-item dflex-c flex1 pos-r h-full" :class="{active: filterIndex === 2}"
				@click="navbarClick(2)">
				<text>价格</text>
				<view class="">
					<view class="iconfont iconjiantou02 ft-dark dflex-c"
						:class="{active: priceOrder === 1 && filterIndex === 2}"></view>
					<view class="iconfont iconjiantou ft-dark dflex-c"
						:class="{active: priceOrder === 2 && filterIndex === 2}"></view>
				</view>
			</view>
		</view>
		
		<!-- 分类区 -->
		<view class="category-area margin-top margin-lr-sm">
			<scroll-view class="" scroll-x>
				<view class="dflex">
					<view class="margin-right-sm" v-for="(item, index) in categoryDatas" :key="index" @click="toCategory(item)">
						<view :class="{ 'active': cid == item._id }" class="item border-radius padding-top padding-bottom-sm padding-lr-sm bg-main dflex-c dflex-flow-c animated-all">
							<image class="border-radius-xs" mode="aspectFill" :lazy-load="true" :src="item.img"></image>
							<text class="margin-top-sm line-height-1 clamp tac">{{ item.name }}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" e-type="search" tip="搜索数据为空" btn-tip="重新搜索" height="50vh" :auto="false"
			@goto="tosearch"></use-empty>
		<view v-else>
			<!-- 商品列表区 -->
			<view class="goods-list margin-top-xs">
				<view class="list dflex-b dflex dflex-wrap-w w-full">
					<view class="item pos-r bg-main border-radius padding-bottom-sm" v-for="(item, index) in goodsDatas"
						:key="index" @click="togoods(item)">
						<view class="image-wrapper">
							<image mode="widthFix" lazy-load :src="item.img"></image>
						</view>
						<text class="title clamp padding-sm">{{ item.name }}</text>
						<view class="padding-left-sm dflex-b">
							<text class="price">{{ item.is_vip === '是' ? item.vip_price / 100 : item.price / 100 }}</text>
							<text class="ft-dark margin-right-sm fs-xs">已售 {{item.sale_cnt }}</text>
						</view>
						
						<view v-if="item.is_vip === '是'" class="use-tag pos-a pos-top bg-base">会员价</view>
					</view>
				</view>
			</view>

			<!-- 上拉加载更多 -->
			<use-loadmore :type="loadmoreType"></use-loadmore>
		</view>

		<!-- 置顶 -->
		<use-totop ref="usetop"></use-totop>

		<!-- 03. 猜你想要 -->
		<use-hot-goods v-if="empty" title-type="round" title="猜你想要"></use-hot-goods>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				empty: false,
				headerPosition: "fixed",
				// 0综合排序 1销量优先 2价格排序
				filterIndex: 0,
				// 1价格从低到高 2价格从高到低
				priceOrder: 0,
				// 商品数据
				goodsDatas: [],
				// 加载更多状态
				loadmoreType: 'more',
				// 请求数据
				reqdata: {
					page: 1,
					rows: 8,
					sidx: 'sort',
					sord: 'asc'
				},
				scrollTop: 0,
				cid: '',
				categoryDatas: [],
				navbarHeight: 0
			};
		},
		watch: {
			// 显示空白页
			goodsDatas(e) {
				let empty = e.length === 0;
				
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		onPageScroll(e) {
			// 兼容iOS端下拉时顶部漂移
			if (e.scrollTop >= 0) {
				this.headerPosition = "fixed";
			} else {
				this.headerPosition = "absolute";
			}
			// this.scrollTop = e.scrollTop
			this.$refs.usetop.change(e.scrollTop);
		},
		//下拉刷新
		onPullDownRefresh() {
			this.loadData('refresh');
		},
		//加载更多
		onReachBottom() {
			this.loadData();
		},
		onLoad(options) {
			let title = '搜索列表';
			if (options && options.hot) {
				title = '热门推荐';
			} else if (options && options.limited) {
				title = '限时精选';
			}
			
			uni.setNavigationBarTitle({
				title: title
			})

			for (let key in options) {
				this.reqdata[key] = decodeURIComponent(options[key]);
			}

			this.loadCategoryData(this.reqdata.cid);
			this.loadData();
		},
		mounted() {
			this.navbarHeight = this.$refs.navbar.navbarHeight;
		},
		methods: {
			// 加载商品，下拉刷新|上拉加载
			async loadData(type = 'add', loading) {

				if (this.loadmoreType === 'loading') {
					// 防止重复加载
					return;
				}

				if (loading == 1 || type == 'refresh') {
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
				this.$func.usemall.call('goods/list', this.reqdata).then(res => {
					if (res.code === 200) {
						if (loading == 1 || type == 'refresh') {
							this.goodsDatas = [];
						}
						
						if (res.datas && res.datas.goods.length > 0) {
							let _datas = [];
							res.datas.goods.forEach((row) => {
								if(row.state === '销售中'){
									_datas.push(row);
								}
							});
							// res.datas.goods.forEach((row) => {
							// 	if(res.res.datas.goods.state === '销售中')
							// });
							this.goodsDatas = [...this.goodsDatas, ..._datas];

							if (res.datas.goods.length >= this.reqdata.rows) {
								this.reqdata.page++;
								this.loadmoreType = 'more'
							} else {
								this.loadmoreType = 'nomore'
							}
						} else {
							this.loadmoreType = 'nomore'
						}
					}

					if (loading == 1) {
						uni.hideLoading()
					} else if (type == 'refresh') {
						uni.stopPullDownRefresh();
					}
				})
			},
			// 点击筛选 
			navbarClick(index) {
				// 
				if (this.filterIndex === index && index !== 2) {
					return;
				}

				this.filterIndex = index;

				if (index === 2) {
					this.priceOrder = this.priceOrder === 1 ? 2 : 1;
				} else {
					this.priceOrder = 0;
				}

				if (this.filterIndex == 0) {
					// 综合排序
					this.reqdata.sidx = 'sort';
					this.reqdata.sord = 'asc';
				} else if (this.filterIndex == 1) {
					// 销量优先
					this.reqdata.sidx = 'sale_cnt';
					this.reqdata.sord = 'desc';
				} else if (this.filterIndex == 2) {
					// 价格排序
					this.reqdata.sidx = 'price';
					if (this.priceOrder == 1) {
						// 降序
						this.reqdata.sord = 'desc';
					} else if (this.priceOrder == 2) {
						// 升序
						this.reqdata.sord = 'asc';
					}
				}

				uni.pageScrollTo({
					duration: 300,
					scrollTop: 0
				})

				this.loadData('refresh', 1);
				uni.showLoading({
					title: '正在加载'
				})
			},
			loadCategoryData(cid) {
				this.cid = cid;
				this.$db['usemall-goods-category'].where({ state: '启用' }).tolist({ rows: 200 }).then(res => {
					if (res.code === 200) {
						let pid = '';
						let _categoryDatas = [];

						res.datas.forEach(item => {
							if (item._id == cid) {
								pid = item.pid;
							}
							
							if (item.pid) {
								_categoryDatas.push(item);
							}
						});
						
						this.categoryDatas = _categoryDatas.filter(x => x.pid == pid || !pid);
					}
				})
			},
			toCategory(item) {
				this.cid = item._id;
				this.reqdata.cid = item._id;
				console.log('tocategory', item, this.reqdata);
				this.loadData('refresh');
			},
			// 搜索页
			tosearch() {
				if (this.$api.pages().length > 1) {
					uni.navigateBack();
					return;
				}
				this.$api.tosearch();
			},
			// 商品详情
			togoods(options) {
				uni.setStorage({
					key: '__goods_data',
					data: options
				});
				
				this.$api.togoods({
					id: options._id
				});
			}
		},
	}
</script>

<style lang="scss">
	page {
		background-color: $page-color-base;
	}

	.navbar {
		top: var(--window-top);
		left: 0;
		height: 100rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, .06);
		z-index: 10;

		.nav-item {
			color: $font-color-dark;
			font-size: 30rpx;

			&.active {
				font-size: 34rpx;
				font-weight: bold;
				
				&:after {
					content: '';
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 120rpx;
					height: 0;
				}
			}
		}

		.iconfont {
			width: 30rpx;
			height: 14rpx;
			font-size: 20rpx;
			line-height: 1;
			margin-left: 4rpx;
		}
	}
	
	.category-area {
		
		.item {
			border-bottom: 4px solid #fff;
			width: 160rpx;
			height: 160rpx;
			
			image {
				width: 60rpx;
				height: 60rpx;
			}
		}
		.active {
			border-bottom: 4px solid #ff6a6c;
			font-weight: bold;
		}
	}

	.goods-list {
		.list {
			padding: 0 3vw 20rpx;
		}

		.item {
			width: 46vw;
			overflow: hidden;
			margin-top: 2vw;

			&:nth-child(2n) {
				margin-left: 1vw;
			}

			&:nth-child(2n + 1) {
				margin-right: 1vw;
			}
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
	}
</style>
