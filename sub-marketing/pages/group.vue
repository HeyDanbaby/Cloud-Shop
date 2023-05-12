<template>
	<view class="">
		<use-navbar title="限时拼团"></use-navbar>
		
		<view v-if="false" class="pos-f w-full dflex-c navbar-area bg-drak" style="width: 100vw; height: 100rpx;">
			<view v-for="(item, idx) in navList" :key="idx" 
				class="nav-item dflex-c pos-r h-full" :class="{ active: idx === navIdx }"
				@click="tabClick(idx)"
				style="width: 33.33%;"
				>
				{{ item }}
			</view>
		</view>
		<view v-if="false" class="" style="height: 100rpx;"></view>
		
		<!-- 商品列表区 -->
		<view class="goods-list margin-top-sm">
			<view class="list w-full">
				<block v-for="(group, idx) in groupDatas" :key="idx">
				<view v-if="group.expires_time > 0" class="item dflex pos-r bg-main border-radius padding-tb-sm" @click="togoods(group)">
					<view class="image-wrapper dflex-c pos-r border-radius-sm margin-left-sm">
						<image mode="widthFix" lazy-load :src="group.goods_obj.img"></image>
						
						<view class="pos-a pos-b-full dflex-c" style="bottom: 0rpx; background: rgba(255, 106, 108, .8); background-color: #f1f1f1;">
							<use-count-down
								fontSize="24"
								separatorSize="24"
								color="#ff6a6c"
								bgColor="rgba(0,0,0,0)"
								:showDays="true"
								separatorColor="#ff6a6c"
								:timestamp="group.expires_time"
								@end="removeData(group)"
								></use-count-down>
						</view>
					</view>
					
					<view class="padding-lr-sm padding-top-xs flex1 dflex-b dflex-flow-c" style="align-items: stretch;">
						<view>
							<text class="title clamp-2">{{ group.goods_obj.name }}</text>
							<view class="dflex margin-top-xl">
								<text class="price">{{ group.goods_price / 100 }}</text>
								<text class="o-price">{{ group.goods_obj.price / 100 }}</text>
							</view>
						</view>
						
						<view class="dflex-b">
							<view class="pos-r dflex" style="height: 56rpx;">
								<image v-for="(gMember, hidx) in group.group_members" :key="hidx" mode="aspectFit" 
									lazy-load 
									class="border-radius-c pos-a headimg"
									style="width: 52rpx; height: 52rpx;"
									:style="{ left: `calc(${hidx} * 40rpx)` }"
									:src="gMember.uheadimg"></image>
								<text v-if="group.group_member_cnt > 5" class="pos-a ft-dark" style="left: calc(216rpx); bottom: 6rpx;">...</text>
							</view>
							<view class="border-radius-big dflex-c fs-xs bg-base" style="width: 140rpx; height: 56rpx;">去拼团</view>
						</view>
					</view>
					
					<view class="use-tag pos-a pos-top bg-base">{{group.group_num}}人团</view>
				</view>
				</block>
			</view>
		</view>
		
		<!-- 上拉加载更多 -->
		<use-loadmore :type="loadmoreType"></use-loadmore>
		
		<view class="safe-area-inset-bottom" style="height: 30rpx;"></view>
		
		<!-- 置顶 -->
		<use-totop ref="usetop"></use-totop>
	</view>
</template>


<script>
	export default {
		data() {
			return {
				empty: false,
				// 拼团数据
				groupDatas: [],
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
				navIdx: 0,
				navList: [
					"拼团列表",
					"我的开团",
					"我的参团"
				]
			};
		},
		watch: {
			// 显示空白页
			groupDatas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		onPageScroll(e) {
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
			this.loadData();
		},
		methods: {
			// 加载商品，下拉刷新|上拉加载
			loadData(type = 'add', loading) {
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
				this.$func.usemall.call('marketing/groupbuy/datas', this.reqdata).then(res => {
					if (res.code === 200) {
						if (res.datas && res.datas.length) {
							if (loading == 1 || type == 'refresh') {
								this.groupDatas = [];
							}
							let datas = [];
							
							res.datas.forEach((row) => {
								if (row.group_members.length) {
									row.group_members = row.group_members.splice(0, 5);
								}
								datas.push(row);
							});
							
							this.groupDatas = [...this.groupDatas, ...datas];

							if (res.datas.length >= this.reqdata.rows) {
								this.reqdata.page++;
								this.loadmoreType = 'more'
							} else {
								this.loadmoreType = 'nomore'
							}
						} else {
							this.loadmoreType = 'nomore'
						}
					}

					if (this.groupDatas.length === 0) {
						this.empty = true;
					}

					if (loading == 1) {
						uni.hideLoading()
					} else if (type == 'refresh') {
						uni.stopPullDownRefresh();
					}
				})
			},
			// 商品详情
			togoods(res) {
				res.__type = 'group';
				uni.setStorage({
					key: '__goods_data',
					data: res
				});
				
				this.$api.togoods({
					id: res.goods_obj._id,
					group_id: res._id,
					__type: res.__type
				});
			},
			tabClick(idx) {
				this.navIdx = idx;
			},
			// 已过期
			removeData(res) {
				// 删除已过期拼团
				res.expires_time = 0;
			}
		},
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f5f5;
	}
	
	.state-area {
		padding: 0 3vw 10rpx;
	}
	.goods-list {
		.list {
			padding: 0 3vw 20rpx;
		}
	
		.item {
			width: 94vw;
			overflow: hidden;
			margin-bottom: 3vw;
			align-items: stretch;
		}
	
		.image-wrapper {
			width: 260rpx;
			height: 260rpx;
			overflow: hidden;
	
			image {
				width: 100%;
				height: 100%;
				opacity: 1;
			}
		}
		
		.headimg {
			border: 1px solid #f5f5f5;
		}
	}
	
	.navbar-area {
		.active {
			font-size: 34rpx;
		}
	}
</style>
