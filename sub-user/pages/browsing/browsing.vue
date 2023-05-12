<template>
	<view class="bg-drak" :class="[empty ? '' : 'padding-tb']">
		<use-navbar title="我的足迹"></use-navbar>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" tip="无足迹数据"></use-empty>

		<view v-else class="padding-lr" v-for="(item, index) in datas" :key="index" @click="togoods(item)">
			<view class="product border-radius padding margin-bottom-sm bg-main" style="padding-bottom: 15rpx;">
				<view class="left pos-r">
					<view v-if="item.tag" class="use-tag pos-a pos-top bg-base" style="z-index: 9;">{{item.tag}}</view>
					<image class="border-radius-sm" :src="item.goods.img" mode="aspectFill"></image>
				</view>
				<view class="margin-left-sm pos-r w-full">
					<text class="clamp-2">{{ item.goods.name }} {{ item.goods.name_pw }}</text>
					<view class="pos-a dflex-b price-box w-full">
						<text class="price">{{ item.goods.price / 100 }}</text>
						<view class="dflex-c ft-dark">
							<view class="dflex-c fs-xs">
								<text class="margin-xs">浏览</text>
								<text>{{ item.visit_cnt }}</text>
							</view>
							<view @tap.stop="deleteBrowsing(item._id)" class="dflex-c margin-left-sm"><text
									class="iconfont iconlajitong-01 margin-left-xs"></text></view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 上拉加载更多 -->
		<use-loadmore v-if="!empty && hasmore" :type="loadmoreType"></use-loadmore>
		<!-- 置顶 -->
		<use-totop ref="usetop" bottom="150"></use-totop>

		<view v-if="!empty" class="fixed-top" @click="clear"><text class="iconfont iconlajitong-01"></text></view>
	</view>
</template>

<script>
	const db = uniCloud.database();
	const _history = 'usemall-goods-history'
	export default {
		data() {
			return {
				// 加载更多状态
				loadmoreType: 'nomore',

				// 浏览历史数据源
				datas: [],
				empty: false,
				hasmore: 0,
				reqdata: {
					rows: 20,
					page: 1
				},
				scrollTop: 0,
			};
		},
		watch: {
			datas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		onPageScroll(e) {
			//this.scrollTop = e.scrollTop;
			this.$refs.usetop.change(e.scrollTop);
		},
		onShow() {
			this.loadData();
		},
		methods: {
			// 加载数据
			loadData() {
				const goodsTemp = db.collection('usemall-goods').getTemp();
				
				db.collection(_history, goodsTemp)
					.where('create_uid == $env.uid')
					.field(
						'_id, param, visit_cnt, last_modify_time, goods.price,goods.name,goods.name_pw, goods._id as goods_id, goods.img, goods.state'
					)
					.orderBy('last_modify_time desc')
					.get()
					.then(res => {
						console.log('history', res);
						if (res && res.result && res.result.errCode === 0) {
							let _historyDatas = [];
							let _typeObj = {
								group: '拼团',
								seckill: '秒杀'
							};
							
							res.result.data.forEach(x => {
								x.goods = x.goods[0];
								x.goods_id = x.goods_id[0];
								
								if (x.param && x.param.__type) {
									x.tag = _typeObj[x.param.__type];
								}
								
								_historyDatas.push(x);
							});
							console.log('_historyDatas', _historyDatas);
							this.datas = _historyDatas;
						}
					});
			},
			// 删除足迹
			deleteBrowsing(id) {
				uni.showModal({
					title: '提示',
					content: '删除足迹',
					success: (res) => {
						if (res.confirm) {
							this.$db[_history].where('create_uid == $env.uid').remove(id).then(res => {
								if (res.code === 200) {
									this.loadData();
								}
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			// 清空所有
			clear() {
				uni.showModal({
					title: '提示',
					content: '清空足迹',
					success: (res) => {
						if (res.confirm) {
							this.$db[_history].where('create_uid == $env.uid').remove().then(res => {
								if (res.code === 200) {
									this.datas = [];
									return;
								}
								this.$api.msg(res.msg)
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			togoods(item) {
				item.param = item.param || {};
				this.$api.togoods({
					id: item.goods_id,
					...item.param
				});
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.product {
		display: flex;

		.left {
			image {
				width: 180rpx;
				height: 180rpx;
			}
		}

		.price-box {
			bottom: 0;
		}
	}
</style>
