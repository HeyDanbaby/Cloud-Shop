<template>
	<view class="">
		<use-navbar title="订单评价"></use-navbar>
		
		<!-- 商品区 -->
		<view class="padding margin-lr margin-tb-sm bg-main border-radius">
			<view class="goods-area" v-for="(item, index) in order_detail" :key="index">
				<view class="dflex">
					<view class="img">
						<image :src="item.goods_sku_img || item.goods_img"></image>
					</view>
					<view class="margin-left-sm">
						<text class="clamp-2">{{ item.goods_name }} {{ item.goods_name_pw }}</text>
						<view class="ft-dark fs-xs padding-top-xs">
							<text class="margin-right">× {{ item.goods_num }}</text>
							{{ item.goods_sku_name || '&nbsp;&nbsp;' }}
						</view>
						<view class="margin-top-sm">
							<text class="price-jf">{{ item.goods_integral }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 评分 -->
		<view class="evaluate-kps">
			<view class="padding margin-lr margin-tb-sm bg-main border-radius dflex-b">
				<view>
					<text>总体评分</text>
					<text class="margin-left ft-base fs-xs">{{postData.review_type}}</text>
				</view>
				<use-rate @change="rateChange" value="5"></use-rate>
			</view>
		</view>

		<!-- 评价区 -->
		<view class="evaluate-area">
			<view class="padding margin-lr margin-tb-sm bg-main border-radius">
				<!-- 评价内容 -->
				<textarea class="ft-black w-full fs-sm" v-model="postData.review_content"
					placeholder="请输入评价内容"></textarea>

				<!-- 上传图片 -->
				<use-upload class="pos-r" @upload="uploadImgs"></use-upload>
			</view>
		</view>

		<!-- 是否匿名评价 -->
		<view>
			<view class="padding margin-lr margin-tb-sm bg-main border-radius dflex-b">
				<text>公开显示您的头像、昵称</text>
				<view>
					<text class="ft-dark">{{ anonymity ? '不公开' : '公开' }}</text>
					<switch color="#FF6A6C" @change="switchChange" />
				</view>
			</view>
		</view>

		<!-- 提交操作 -->
		<view class="padding w-full margin-top">
			<view class="dflex-b border-radius-big">
				<view class="tac padding-tb-sm flex1 bg-base" @click="submit">提交评价</view>
			</view>
		</view>

		<!-- 用云版权 -->
		<use-copyright></use-copyright>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				// 商品数据
				order_detail: [],
				// 订单数据
				order_data: {},
				// 订单ID
				order_id: '',
				postData: {
					order_id: '',
					review_cnt: 5,
					review_type: '好评',
					review_content: '',
					review_imgs: '',
					review_anonymity: false,
				}
			};
		},
		onLoad(options) {
			this.order_id = options.id;
			if (!this.order_id) {
				this.$api.msg('订单编号不存在');
			}
			this.loadData();
		},
		methods: {
			loadData() {
				this.$func.usemall.call('integral/orderDetail', {
					order_id: this.order_id
				}).then(res => {
					if (res.code === 200) {
						this.order_data = res.datas.order;
						this.order_detail = res.datas.order_detail;
					}
				})
			},
			uploadImgs(options) {
				let imgs = [];

				options.forEach((_) => {
					imgs.push(_.url);
				});

				if (imgs.length > 0) this.postData.review_imgs = imgs;

				console.log('uploadImgs', this.postData.review_imgs);
			},
			submit() {
				if (!this.postData.review_content) {
					this.$api.msg('请填写评价内容');
					return;
				}
				if (this.isubmit) return;

				this.isubmit = true;
				this.postData.order_id = this.order_id;
				uni.showModal({
					title: '提示',
					content: '提交评价',
					success: (res) => {
						if (res.confirm) {
							this.$func.usemall.call('integral/orderEvaluate', this.postData)
								.then(res => {
									this.isubmit = false;
									if (res.code === 200) {
										this.$api.msg('提交成功');
										// setTimeout(() => {
										uni.navigateBack({});
										//}, 1000);
										return;
									}
									this.$api.msg(res.msg);
								})
							return;
						} 
						
						this.isubmit = false;
					}
				});

			},
			switchChange(options) {
				this.postData.review_anonymity = options.detail.value;
			},
			rateChange(options) {
				switch (options.value) {
					case 1:
						this.postData.review_type = '差评';
						break;
					case 2:
					case 3:
						this.postData.review_type = '中评';
						break;
					case 4:
					case 5:
						this.postData.review_type = '好评';
						break;
				}
				this.postData.review_cnt = options.value;
			}
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
</style>
