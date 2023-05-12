<template>
	<view class="margin-sm">
		<use-navbar title="意见反馈"></use-navbar>
		
		<view class="padding bg-main margin-bottom-sm border-radius dflex-b" @click="toFeedbackType">
			<view class="dflex">
				<view class="iconfont iconmingxi ft-base margin-right-xs"></view>
				<view class="fwbd">反馈类型</view>
			</view>
			
			<view class="dflex margin-left">
				<view class="fwbd">{{ feedbackType.type || '请选择' }}</view>
				<view class="iconfont iconjiantou-01 fwb"></view>
			</view>
		</view>

		<!-- 标题 -->
		<view class="padding bg-main margin-bottom-sm border-radius dflex-b">
			<input type="text" maxlength="20" class="wh-full" v-model="postData.title" placeholder="标题(不超过20个字)" />
		</view>

		<view class="padding bg-main margin-bottom-sm border-radius">
			<textarea class="ft-black w-full fs-sm" v-model="postData.content" placeholder="请输入反馈内容"></textarea>

			<!-- 上传图片 -->
			<use-upload class="pos-r" @upload="uploadImgs"></use-upload>
		</view>
		
		<!-- 联系方式 -->
		<view class="padding bg-main margin-bottom-sm border-radius dflex-b">
			<input type="text" maxlength="30" class="wh-full" v-model="postData.contact_way" placeholder="联系方式(手机号/邮箱/QQ)" />
		</view>
		
		<!-- 提交操作 -->
		<view class="padding w-full margin-top">
			<view class="dflex-b border-radius-big">
				<view class="tac padding-tb-sm fwb flex1 bg-base" @click="submit">提交</view>
			</view>
		</view>
		
		<use-popup v-model="feedbackTypePopup" bgclass=" " mode="bottom">
			<view class="padding bg-main border-radius-top30" style="max-height: 65vh;">
				<view v-for="(item, idx) in feedbackTypeDatas" :key="idx" :class="{ 'border-line': idx < feedbackTypeDatas.length - 1 }" class="padding-16" @click="feedbackType = item; feedbackTypePopup = false;">
					<view class="fwbd">{{item.type}}</view>
					<view class="ft-dark fs-xxs">{{item.description}}</view>
				</view>
			</view>
		</use-popup>

		<!-- 用云版权 -->
		<use-copyright></use-copyright>
	</view>
</template>
<script>
	import { mapState } from 'vuex';
	
	export default {
		computed: {
			...mapState(['member'])
		},
		data() {
			return {
				feedbackTypePopup: false,
				feedbackType: {},
				feedbackTypeDatas: [],
				isubmit: false,
				postData: {
					type_id: '',
					type_name: '',
					title: '',
					imgs: [],
					content: '',
					contact_way: ''
				}
			};
		},
		onLoad(options) {
			
			this.loadData();
		},
		methods: {
			async loadData() {
				let _this = this;
				
				_this.$db['usemall-app-feedback-type'].where({ state: '显示' }).tolist().then(res => {
					if (res.code == 200) {
						this.feedbackTypeDatas = res.datas;
					}
				});
			},
			uploadImgs(options) {
				if (options.length > 0) this.postData.imgs = options;

				console.log('uploadImgs', this.postData.imgs);
			},
			submit() {
				let _this = this;
				
				this.postData.type_id = this.feedbackType._id;
				this.postData.type_name = this.feedbackType.type;
				
				if (!this.postData.type_id) {
					this.$api.msg('请选择反馈类型');
					return;
				}
				if (!this.postData.title) {
					this.$api.msg('请填写标题');
					return;
				}
				if (!this.postData.content) {
					this.$api.msg('请填写反馈内容');
					return;
				}
				if (!this.postData.contact_way) {
					this.$api.msg('请填写联系方式');
					return;
				}
				
				if (this.isubmit) return;

				this.isubmit = true;
				uni.showModal({
					title: '提示',
					content: '提交',
					success: (res) => {
						this.isubmit = false;
						if (res.confirm) {
							this.$func.usemall.call('member/feedback', this.postData).then(res => {
								if (res.code == 200) {
									this.$api.alert('反馈成功，谢谢！', () => {
										this.$api.back();
									});
								}
							});
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			toFeedbackType() {
				this.feedbackTypePopup = true;
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
