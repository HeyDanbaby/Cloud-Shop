<template>
	<view class="">
		<use-navbar title="订单评价"></use-navbar>
		
		<view v-for="(item, idx) in order_details" :key="idx" class="margin-bottom-xl">
			<view v-if="order_details.length > 1" class="padding-lr-xl fwbd fs">商品 {{(idx+1)}}</view>
			<!-- 商品区 -->
			<view class="padding margin-lr margin-tb-sm bg-main border-radius">
				<view class="goods-area">
					<view class="dflex pos-r">
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
						
						<view v-if="item.goods_price_tag" class="use-tag pos-a pos-top bg-base margin-right-sm">{{item.goods_price_tag}}</view>
					</view>
				</view>
			</view>

			<!-- 评分 -->
			<view class="evaluate-kps">
				<view class="padding margin-lr margin-tb-sm bg-main border-radius dflex-b">
					<view>
						<text>宝贝评分</text>
						<text class="margin-left ft-base fs-xs">{{ postDatas[idx].review_type }}</text>
					</view>
					<use-rate @change="(rate) => rateChange(rate, idx)" value="5"></use-rate>
				</view>
			</view>

			<!-- 评价区 -->
			<view class="evaluate-area">
				<view class="padding margin-lr margin-tb-sm bg-main border-radius">
					<!-- 评价内容 -->
					<textarea class="ft-black w-full fs-sm" maxlength="260" 
						v-model="postDatas[idx].review_content"
						:class="[`content_${idx}`]"
						:focus="postDatas[idx].focus"
						placeholder="请输入评价内容"></textarea>

					<!-- 上传图片 -->
					<use-upload class="pos-r" @upload="(imgs) => uploadImgs(imgs, idx)"></use-upload>
				</view>
			</view>

			<view>
				<view class="padding margin-lr margin-tb-sm bg-main border-radius dflex-b">
					<text>公开显示您的头像、昵称</text>
					<view>
						<text class="ft-dark">{{ !postDatas[idx].review_anonymity ? '公开' : '不公开' }}</text>
						<switch checked color="#FF6A6C" @change="(res) => switchChange(res, idx)" />
					</view>
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
				// 订单ID
				order_id: '',
				// 订单数据
				order_data: {},
				// 商品数据
				order_details: [],
				postDatas: []
			};
		},
		onLoad(options) {
			this.order_id = options.id;
			if (!this.order_id) {
				this.$api.msg('订单编号不存在');
				return;
			}
			this.loadData();
		},
		methods: {
			async loadData() {
				await this.$func.usemall.call('order/detail', {
					order_id: this.order_id
				}).then(res => {
					if (res.code === 200) {
						this.order_data = res.datas.order;
						this.postDatas = []
						res.datas.order_detail.forEach(x => {
							this.postDatas.push({
								_id: x._id,
								order_id: this.order_id,
								review_cnt: 5,
								review_type: '好评',
								review_content: '',
								review_imgs: [],
								review_anonymity: false
							});
						});
						this.order_details = res.datas.order_detail;
						console.log('this.order_details', this.order_details);
					}
				})
			},
			uploadImgs(objs, idx) {
				let imgs = [];

				objs.forEach((_) => {
					imgs.push(_.url);
				});

				this.postDatas[idx].review_imgs = imgs;
				console.log('uploadImgs', this.postDatas[idx].review_imgs);
			},
			switchChange(res, idx) {
				console.log('switchChange', res, this.postDatas[idx]);
				this.postDatas[idx].review_anonymity = !res.detail.value;
			},
			rateChange(rate, idx) {
				console.log('switchChange', rate, this.postDatas[idx]);
				switch (rate.value) {
					case 1:
						this.postDatas[idx].review_type = '差评';
						break;
					case 2:
					case 3:
						this.postDatas[idx].review_type = '中评';
						break;
					case 4:
					case 5:
						this.postDatas[idx].review_type = '好评';
						break;
				}
				this.postDatas[idx].review_cnt = rate.value;
			},
			submit() {
				let flag = false;
				for (let idx = 0; idx < this.postDatas.length; idx++) {
					let item = this.postDatas[idx];
					item.focus = false;
					delete item.focus;
					if (!item.review_content) {
						// this.$api.msg(`请填写[商品 ${idx+1}]的评价内容`);
						// flag = true;
						// this.$nextTick(() => {
						// 	item.focus = true;
						// });
						// uni.pageScrollTo({
						// 	selector: `.content_${idx}`
						// })
						// return;
						item.review_content = '此用户没有填写评价';
					}
				}
				if (flag) return;
				
				if (this.isubimt) return;
				this.isubimt = true;
				
				uni.showModal({
					title: '提示',
					content: '提交评价',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({ title: '提交中' })
							this.$func.usemall.call('order/evaluateV2', { order_id: this.order_id, datas: this.postDatas })
								.then(res => {
									this.isubimt = false;
									uni.hideLoading();
									if (res.code === 200) {
										this.$api.msg('提交成功');
										uni.navigateBack({});
										return;
									}
									
									if (typeof res.msg === 'object') {
										this.$api.msg(this.$api.getSecMessage(res.msg), 2300);
										return;
									}
									this.$api.msg(res.msg);
								})
							return;
						} 
						
						this.isubimt = false;
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
