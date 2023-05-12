<template>
	<view class="">
		<use-navbar :title="title"></use-navbar>
		
		<view v-if="seckillData && seckillData._id" class="state-area margin-top-sm">
			<view class="padding border-radius bg-base">
				<view class="dflex-c fs-lg">
					<text class="iconfont icondaishouhuo- fs-lg fwb"></text>
					<text class="fwb margin-left-sm">距离活动结束</text>
				</view>
				<view class="dflex-c">
					<text class="margin-right-sm">剩余时间</text>
					<use-count-down 
						fontSize="24"
						separatorSize="24"
						color="#fff"
						bgColor="#ff6a6c"
						:showDays="true"
						separatorColor="#fff"
						:timestamp="seckillData.expires_time"
						@end="removeData"
						></use-count-down>
				</view>
			</view>
		</view>
		<use-loading v-if="!isload"></use-loading>

		<!-- 商品列表区 -->
		<view class="goods-list">
			<view class="list dflex-b dflex dflex-wrap-w w-full">
				<view class="item pos-r bg-main border-radius padding-bottom-sm" 
					v-for="(item, idx) in seckillData.goods_objs" :key="idx" @click="togoods(item)">
					<view class="image-wrapper">
						<image mode="widthFix" lazy-load :src="item.img"></image>
					</view>
					<text class="title clamp padding-sm">{{ item.name }}</text>
					<view class="padding-left-sm dflex">
						<text class="price">{{ item.price / 100 }}</text>
						<text class="o-price">{{ item.market_price / 100 }}</text>
					</view>
					
					<view class="use-tag pos-a pos-top bg-base">秒杀价</view>
				</view>
			</view>
		</view>
		
		<view class="safe-area-inset-bottom" style="height: 30rpx;"></view>
		
		<!-- 置顶 -->
		<use-totop ref="usetop"></use-totop>
	</view>
</template>


<script>
	export default {
		data() {
			return {
				isload: false,
				empty: false,
				// 秒杀数据
				seckillData: [],
				// 加载更多状态
				loadmoreType: 'more',
				scrollTop: 0,
				title: '限时秒杀'
			};
		},
		watch: {
			// 显示空白页
			goodsDatas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			},
			title(nv, ov) {
				uni.setNavigationBarTitle({
					title: nv
				})
			}
		},
		onPageScroll(e) {
			this.$refs.usetop.change(e.scrollTop);
		},
		//下拉刷新
		onPullDownRefresh() {
			this.loadData();
		},
		onLoad(options) {
			this.loadData();
		},
		methods: {
			// 加载商品
			async loadData() {
				this.$func.usemall.call('marketing/seckill/data', {
				}).then(res => {
					this.isload = true;
					console.log('seckill data', res);
					if (res.code === 200) {
						this.seckillData = res.datas || {};
						if (this.seckillData && this.seckillData._id) this.title = this.seckillData.name;
						uni.stopPullDownRefresh();
					}
				});
			},
			// 商品详情
			togoods(res) {
				
				res = {
					goods_obj: res,
					...this.seckillData
				}
				res.__type = 'seckill';
				
				uni.setStorage({
					key: '__goods_data',
					data: res
				});
				
				this.$api.togoods({
					id: res.goods_obj._id,
					seckill_id: this.seckillData._id,
					__type: res.__type
				});
			},
			// 已过期
			removeData(res) {
				if (this.seckillData && this.seckillData._id) {
					// 清除已过期数据
					this.seckillData = {};
					
					this.$api.alert('秒杀活动已结束', () => {
						this.$api.back();
					});
				}
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
