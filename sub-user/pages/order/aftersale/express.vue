<template>
	<view class="content bg-drak ft-main">
		<use-navbar :title="title"></use-navbar>
		<!-- 售后状态 -->
		<view class="state-area padding-lr margin-tb-sm">
			<view class="padding border-radius bg-base">
				<view class="dflex-c fs-lg">
					<text class="iconfont icondaifukuan- fs-lg fwb"></text>
					<text class="fwb margin-left-sm">寄回售后商品</text>
				</view>
				<view class="dflex-c">请核对填写的快递信息</view>
			</view>
		</view>
		
		<view class="margin-lr padding-bottom-sm">
			<use-list-title title="快递公司" type="round" color="#333" :tip="postData.com" iconfont=" "
				@goto="openActionSheet"></use-list-title>
		</view>
		
		<view class="padding-lr margin-lr margin-bottom-sm bg-main border-radius dflex">
			<text class="tit">快递单号</text>
			<input class="input" type="text" v-model="postData.no" placeholder="请输入快递单号"
				placeholder-class="placeholder" />
		</view>
		
		<view class="padding margin-lr margin-bottom-sm bg-main border-radius">
			<textarea v-model="postData.remark" class="ft-black w-full margin-0 padding-0 fs-sm"
				placeholder="请填写说明（选填）"></textarea>
		</view>

		<view class="w-full" style="padding: 60rpx 15vw 30rpx;">
			<view class="dflex-b border-radius-big">
				<view class="tac padding-tb-sm flex1 bg-base" @click="toSubmit">提交</view>
			</view>
		</view>
		
		
		<!-- 操作菜单 -->
		<use-action-sheet v-model="actionSheetShow" :list="actionSheetList" :tips="actionSheetTips"
			@click="actionSheetClick"></use-action-sheet>
	</view>
</template>

<script>
	import { mapState } from 'vuex';
	
	const __name = 'usemall-member-address';
	export default {
		computed: {
			...mapState(['islogin', 'member'])
		},
		data() {
			return {
				isubmit: 0,
				postData: {
					no: '',
					com: '',
					remark: ''
				},
				id: 0,
				title: '填写物流单号',
				actionSheetShow: false,
				actionSheetList: [],
				actionSheetTips: {
					text: "请选择快递公司",
					color: "#9a9a9a",
					size: 24
				}
			};
		},
		onLoad(options) {
			this.id = options.id;
			if (!this.id) {
				this.$api.msg('售后ID不存在');
			}
		},
		methods: {
			// 打开操作菜单
			openActionSheet() {
			
				let type = 'express';
				let actionSheetList = [];
			
				actionSheetList = [{
					text: "顺丰速运",
					color: "#333",
					type: type
				}, {
					text: "京东物流",
					color: "#333",
					type: type
				}, {
					text: "圆通速递",
					color: "#333",
					type: type
				},{
					text: "中通快递",
					color: "#333",
					type: type
				},{
					text: "申通快递",
					color: "#333",
					type: type
				},{
					text: "韵达快递",
					color: "#333",
					type: type
				},{
					text: "百世快递",
					color: "#333",
					type: type
				}, {
					text: "邮政快递",
					color: "#333",
					type: type
				}];
			
				this.actionSheetShow = true;
				this.actionSheetList = actionSheetList;
			},
			// 点击操作菜单
			actionSheetClick(index) {
				let item = this.actionSheetList[index];
				this.postData.com = item.text;
			},
			//提交
			toSubmit() {
				const data = this.postData;
				
				if (!data.com) {
					this.$api.msg('请选择快递公司');
					return;
				}
				if (!data.no) {
					this.$api.msg('请填写快递单号');
					return;
				}
				
				if (this.isubmit) return;
				this.isubmit = 1;
				
				uni.showLoading({
					title: '请稍后'
				});
				
				this.$func.usemall.call('orderaftersale/selfExpress', {
					aftersale_id: this.id,
					...data
				}).then(res => {
					uni.hideLoading();
					this.isubmit = 0;
					
					if (res.code === 200) {
						this.$api.msg('提交成功');
						this.$api.back();
						return;
					}
					
					this.$api.msg(res.msg);
				})
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

		.tit {
			flex-shrink: 0;
			width: 150rpx;
		}

		.input {
			flex: 1;
			padding-left: 0;
			height: 100rpx;
			line-height: 100rpx;
		}

		.input_t {
			color: #333;
		}
</style>
