<template>
	<view class="margin-sm">
		<use-navbar title="商品评价"></use-navbar>

		<view class="state-area use-area dflex">
			<view class="item margin-right-sm" :class="{ active: state == item.name }"
				v-for="(item, index) in stateDatas" :key="index" @click="change(item)">
				<text style="font-size: 26rpx;">{{ item.name }}({{ item.cnt }})</text>
			</view>
		</view>

		<!-- 评价区 -->
		<view class="evaluate-area">
			<view class="use-area eva-box padding-bottom-lg" v-for="(item, index) in evaluateDatas" :key="index">
				<view class="dflex-b">
					<view class="dflex">
						<image class="portrait border-radius-c" :src="item.member_headimg || '/static/images/user/default.png'"></image>
						<view class="margin-left-sm">
							<text class="fwbd margin-right">{{ item.member_name }}</text>
							<use-rate class="line-height-1" icon-size="fs" :value="item.review_cnt" disabled></use-rate>
						</view>
					</view>
					<text class="time fs-xs ft-dark">{{ $api.format(item.create_time, 'yyyy-MM-dd') }}</text>
				</view>
				<view class="right-area flex1">
					<view class="fs-sm ft-main margin-top-xs margin-bottom-sm break-all">{{ item.review_content }}</view>
					<view class="dflex dflex-wrap-w">
						<view v-for="(img, i) in item.review_imgs" :key="i" class="dflex-c image-area border-radius">
							<image :src="img" lazy-load mode="widthFix" @click.stop="preview(item.review_imgs, img)"></image>
						</view>
					</view>
					<!-- <view class="dflex dflex-wrap-w">
						<image v-for="(img, i) in item.review_imgs" :src="img" :key="i" mode="widthFix" class="border-radius" @click="preview(item.imgs, img)"></image>
					</view> -->
					<view v-if="item.goods_type" class="padding-bottom-sm">
						<text class="fs-xxs ft-dark">{{ item.goods_type }}</text>
					</view>
					
					<view v-if="item.replay_content" class="margin-top-xs bg-drak padding-lr padding-tb-sm border-radius" style="color: #525252;" 
						@click="openReplay(item)">
						<text class="clamp-lh" :class="{ 'clamp-2': !item.replay_open }">商家回复: {{item.replay_content}}</text>
					</view>
				</view>
			</view>
		</view>
		
		<view class="w-full" style="height: 30rpx;"></view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				// 评价状态
				stateDatas: [
					{name: '全部', cnt: 0},
					{name: '好评', cnt: 0},
					{name: '中评', cnt: 0},
					{name: '差评', cnt: 0}
				],
				// 评价数据
				evaluateDatas: [],
				// 商品ID
				goods_id: 0,
				// 评价类型
				state: '全部',
				// 商品评价
				dbname: 'usemall-goods-comment'
			};
		},
		onLoad(res) {
			this.goods_id = res.id;
			if (res.type == 'integral') {
				// 积分商品评价
				this.dbname = 'usemall-integral-comment';
			}
			
			this.loadState();
			this.loadData();
		},
		methods: {
			loadData() {
				
				this.$db[this.dbname]
					.where({
						goods_id: this.goods_id,
						state: '显示'
					})
					.whereif(this.state != '全部', {
						review_type: this.state
					})
					.tolist({
						rows: 30,
						orderby: 'create_time desc'
					})
					.then(res => {
						if (res.code === 200) {
							res.datas.forEach(x => {
								x.replay_open = false;
							})
							this.evaluateDatas = res.datas;
						}
					});
			},
			loadState() {
				const $ = this.$dbcmd.aggregate;
				this.$db[this.dbname]
					.collection()
					.aggregate()
					.match({
						goods_id: $.eq(this.goods_id),
						state: '显示'
					})
					.group({
						_id: '$review_type',
						num: $.sum(1)
					})
					.end()
					.then(res => {
						let total = 0;
						res.result.data.forEach(x => {
							this.stateDatas.find(s => s.name == x._id).cnt = x.num;
							total += x.num;
						});
				
						this.stateDatas.find(x => x.name == '全部').cnt = total;
						// this.stateDatas = [{
						// 	name: '全部',
						// 	cnt: total
						// }, ...__stateDatas];
					});
			},
			openReplay(res) {
				res.replay_open = !res.replay_open;
			},
			change(options) {
				this.state = options.name;

				this.loadData();
			},
			preview(imgs, cur) {
				if (!imgs) return;

				uni.previewImage({
					urls: imgs,
					current: cur,
					longPressActions: {
						itemList: ['发送给朋友', '保存图片', '收藏'],
						success: function(data) {
							console.log(res);
						},
						fail: function(err) {
							console.log(err);
						}
					}
				});
			}
		}
	};
</script>
<style lang="scss">
	page {
		background: $page-color-base;
	}

	.state-area {
		.item {
			text {
				padding: 10rpx 20rpx;
				border: 1px solid #f0f0f0;
				border-radius: 30rpx;
			}

			&:last-child {
				margin-right: 0;
			}
		}
	}

	.evaluate-area {
		.portrait {
			flex-shrink: 0;
			width: 80rpx;
			height: 80rpx;
		}

		.image-area {
			height: 200rpx;
			width: 30%;
			margin-right: 10rpx;
			margin-bottom: 10rpx;
			border: 1px solid #f5f5f5;
			
			image {
				width: 100%;
				height: 100%;
			}
		}
	}
</style>
