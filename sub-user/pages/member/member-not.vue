<template>
	<view class="padding">
		<use-navbar title="会员中心" bgColor="#ff6a6c"></use-navbar>
		<use-fixbg></use-fixbg>
		
		<view class="vip-area border-radius padding-lg padding-bottom padding-lr-xl w-full dflex-b dflex-flow-c">
			<view class="dflex-b w-full">
				<view class="dflex-c">
					<image :src="member.member_headimg || '/static/images/user/default.png'" mode="aspectFit" class="border-radius-c margin-right-sm"
						style="width: 80rpx; height: 80rpx;"></image>
					<view class="ft-white">
						<view class="fwb fs-30">{{ islogin ? member.member_nickname || appabbr || '用云会员' : '去登录' }}</view>
						<view class="fs-xxs">开通会员立享<text class="ft-base">5</text>大权益</view>
					</view>
				</view>
				<view class="bg-base border-radius-lg fs-xs padding-lr-sm padding-tb-xxs" @click="openMember">
					立即开通
				</view>
			</view>
			<view class="dflex-b w-full">
				<view class="dflex" @click="toContent">
					<text style="line-height: 30px;" class="iconfont iconhuiyuan ft-base fs-xl margin-right-xs"></text>
					<text class="fs-xs" style="color: #5c5c5c;">开通说明</text>
				</view>
				<view class="fs-xs">
					<text style="color: #5c5c5c;">开通预计省<text class="fwb price">{{ setting.vip_pre_saved_amount || '--' }}</text></text>
				</view>
			</view>
		</view>
		<view class="border-radius-big fwb tac padding-tb-16 ft-base pos-r pos-l-c fs" 
			style="width: 360rpx; top: 40rpx; z-index: 1; border: 1px solid #ff6a6c; background: #fef0ef;">
			会员5大权益
		</view>
		<view class="bg-main border-radius padding padding-top-lg padding-bottom-big dflex dflex-wrap-w">
			<view class="tac margin-top-xxl" style="width: 33.33%;">
				<view class="">
					<image src="/static/images/member/1.png" class="img-item" mode="aspectFit"></image>
				</view>
				<view class="">
					会员价
				</view>
				<view class="ft-dark">
					更省心/更划算
				</view>
			</view>
			<view class="tac margin-top-xxl" style="width: 33.33%;">
				<view class="">
					<image src="/static/images/member/2.png" class="img-item" mode="aspectFit"></image>
				</view>
				<view class="">
					会员券
				</view>
				<view class="ft-dark">
					每月可领券
				</view>
			</view>
			<view class="tac margin-top-xxl" style="width: 33.33%;">
				<view class="">
					<image src="/static/images/member/3.png" class="img-item" mode="aspectFit"></image>
				</view>
				<view class="">
					专属客服
				</view>
				<view class="ft-dark">
					一键召唤
				</view>
			</view>
			<view class="tac margin-top-xxl" style="width: 33.33%;">
				<view class="">
					<image src="/static/images/member/4.png" class="img-item" mode="aspectFit"></image>
				</view>
				<view class="">
					退换货
				</view>
				<view class="ft-dark">
					7天无理由
				</view>
			</view>
			<view class="tac margin-top-xxl" style="width: 33.33%;">
				<view class="">
					<image src="/static/images/member/5.png" class="img-item" mode="aspectFit"></image>
				</view>
				<view class="">
					{{ setting.vip_integral_mul || '-' }}倍积分
				</view>
				<view class="ft-dark">
					专属双倍积分
				</view>
			</view>
		</view>
		<view class="margin-top-big border-radius-lg pos-a" style="bottom: 60rpx; left: 30rpx; right: 30rpx;">
			<view class="tac fwb flex1 bg-base dflex overflow-hidden" @click="openMember">
				<view class="flex1 padding-tb-sm tal padding-left-xl margin-left">
					<text class="fs-34 line-height-1">￥{{setting.vip_fees || '--'}}/年</text>
				</view>
				<view class="bg-warn ft-white padding-tb-sm" style="width: 40%;">立即开通</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	export default {
		computed: {
			...mapState(['islogin', 'member']),
			appabbr() {
				return this.$config.appabbr;
			}
		},
		data() {
			return {
				setting: {},
			};
		},
		onLoad(options) { },
		onShow() {
			this.loadData();
		},
		methods: {
			async loadData() {
				this.$func.usemall.call('vip/data').then(res => {
					if (res.code == 200) {
						this.setting = res.datas.parameter;
						return;
					}
					
					this.$api.msg(res.msg);
				});
			},
			// 检查当前会员状态
			validateMember(callback) {
				// 判断当前会员状态
				if (this.member && this.member.is_plus === '付费会员' && this.member.plus_time >= Date.now()) {
					uni.showModal({
						title: '当前已是VIP会员，是否开通下一年会员服务',
						confirmText: '确定',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								typeof callback === 'function' && callback();
							}
						}
					})
					return;
				}
				
				typeof callback === 'function' && callback();
			},
			// 立即开通
			openMember() {
				if (!this.islogin) {
					this.$api.tologin()
					return;
				}
				
				this.validateMember(() => {
					if (this.setting && this.setting.vip_fees > 0)
					{
						this.$api.msg('去支付 ...');
						uni.redirectTo({
							url: '/sub-user/pages/member/pay?money=' + this.setting.vip_fees
						})
						return;
					}
					
					this.$api.msg('当前会员模式未启动');
				});
				
			},
			toContent() {
				if (!(this.setting && this.setting.desc)) return;
				
				const content = `<div class="__rich_text">${this.setting.desc.replace(/<h1/gi, '<h1 class="use-p"').replace(/<h3/gi, '<h3 class="use-p"').replace(/<p/gi, '<p class="use-p"')}</div>`;
				
				uni.setStorage({
					key: '__rich_text',
					data: content,
					success() {
						uni.navigateTo({
							url: '/pages/content/rich-text'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f5f5;

		.vip-area {
			background-image: url('/static/images/member/0.png');
			background-repeat: no-repeat;
			background-size: 100% 100%;
			height: 280rpx;
		}

		.img-item {
			width: 66rpx;
			height: 66rpx;
		}

		.ft-dark {
			font-size: 22rpx;
		}
	}
</style>
