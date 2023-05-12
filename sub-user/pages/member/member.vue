<template>
	<view class="padding-sm">
		<use-navbar title="会员中心" bgColor="#ff6a6c"></use-navbar>
		<use-fixbg></use-fixbg>

		<view class="vip-area border-radius padding-top-lg padding-lr-xl padding-bottom w-full dflex-b dflex-flow-c">
			<view class="dflex-b w-full">
				<view class="dflex flex1">
					<image :src="member.member_headimg || '/static/images/user/default.png'" mode="aspectFit" class="border-radius-c margin-right-sm"
						style="width: 80rpx; height: 80rpx;"></image>
					<view class="ft-white dflex-s dflex-flow-c">
						<view class="fwb fs-30">{{ member.member_nickname || appabbr || '用云会员' }}</view>
						<view style="color: #b65b5d" class="fs-xxs dflex-c" @click="toContent">
							<text>权益说明</text>
							<text class="iconfont iconjiantou-01 fs-xxs"></text>
						</view>
					</view>
				</view>
				
				<!-- #ifdef MP-WEIXIN -->
				<button class="btn no-border dflex use-hover" open-type="contact">
					<view class="btn-area dflex-c dflex-flow-c">
						<text class="iconfont iconkefu-011 ft-white fs-xxxl"></text>
					</view>
				</button>
				<!-- #endif -->
			</view>
			<view class="dflex-b dflex-afe dflex-ae w-full">
				<view class="dflex" @click="toContent">
					<text style="line-height: 30px;" class="iconfont iconhuiyuan ft-base fs-xl margin-right-xs"></text>
					<text class="fs-xs" style="color: #5c5c5c;">{{appabbr}}VIP</text>
				</view>
				<text style="color: #5c5c5c;" class="fs-xs">到期时间：{{ $api.format(member.plus_time, 'yyyy-MM-dd') || '--'}}</text>
			</view>
		</view>

		<view class="dflex-b margin-top-sm">
			<view class="border-radius dflex-c padding-lg bg-main margin-right-xs wpre-50" @click="toIntegral">
				<image src="/static/images/member/6.png" style="width: 60rpx; height: 60rpx;"></image>
				<view class="margin-left-lg">
					<view class="fs-30 fwb">
						{{ $api.format_number(member.member_integral) || '0'}}
					</view>
					<view class="fs-xxs ft-dark">我的积分</view>
				</view>
			</view>
			<view class="border-radius dflex-c padding-lg bg-main margin-left-xs wpre-50">
				<image src="/static/images/member/7.png" style="width: 60rpx; height: 60rpx;"></image>
				<view class="margin-left-lg">
					<view class="fs-30 fwb">
						￥{{ $api.format_number(member.member_economize / 100) || '0'}}
					</view>
					<view class="fs-xxs ft-dark">已省金额</view>
				</view>
			</view>
		</view>

		<view v-if="false" class="bg-main margin-top-sm border-radius padding padding-tb-lg dflex dflex-wrap-w">
			<view class="margin-bottom-sm w-full">
				<view class="dotted-line">会员礼包</view>
			</view>

			<scroll-view class="" scroll-x="true" scroll-left="true">
				<view class="dflex">
					<view class="" v-for="(item,index) in [1,1,1,1,1,1,1,1,1,1]" :key="index">
						<view
							style="background-color: #fef0ef; width: 180rpx; padding-top: 30rpx; padding-bottom: 12rpx;"
							class="margin-right-sm tac border-radius-sm">
							<view class="">
								<text class="fs-xxxl price line-height-0">50</text>
							</view>
							<view style="color: #9a9a9a;" class="fs-xs">
								全品类
							</view>
							<view style="color: #9a9a9a;border-top: 1px dashed #fff;"
								class="padding-top-xs margin-top-xs fs-xs">
								满500可用
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="dflex-c w-full margin-top-lg" @click="receive">
				<view class="tac border-radius-lg padding-tb-16 fwb"
					style="border: 1px solid #ff6a6c; color: #ff6a6c; background: #fef0ef; width: 55%;">一键领取</view>
			</view>
		</view>

		<!-- 会员商品 -->
		<use-goods title-type="round" title="会员商品"></use-goods>
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
				pay_id: '',
				setting: {}
			};
		},
		onLoad(options) {
			this.pay_id = options.pay_id || '';
			
			this.loadData();
		},
		methods: {
			...mapMutations(['logout', 'putMember']),
			async loadData() {
				this.$func.usemall.call('vip/data').then(res => {
					if (res.code == 200) {
						this.setting = res.datas.parameter;
						if (res.datas.member && res.datas.member.is_plus === '付费会员') {
							res.datas.member.vip = res.datas.member.plus_time >= new Date().getTime();
							// this.member = res.member;
							// 更新会员数据
							this.putMember(res.datas.member);
						} 
						
						if (!this.member.vip) {
							// todo 当前不是会员，查看是否已过期，或未开通，或已支付未处理回调成功
							
						}
						
						return;
					}
				});
			},
			// 领取优惠券
			receive() {
				this.$api.msg('一键领取开发中')
			},
			// 客服
			service() {
				this.$api.msg('联系客服开发中')
			},
			toContent() {
				if (!(this.setting && this.setting.vip_desc)) return;
				
				const content = `<div class="__rich_text">${this.setting.vip_desc.replace(/<h1/gi, '<h1 class="use-p"').replace(/<h3/gi, '<h3 class="use-p"').replace(/<p/gi, '<p class="use-p"')}</div>`;
				
				uni.setStorage({
					key: '__rich_text',
					data: content,
					success() {
						uni.navigateTo({
							url: '/pages/content/rich-text'
						})
					}
				})
			},
			toIntegral() {
				uni.navigateTo({
					url: '/sub-user/pages/integral/integral'
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f5f5;

	}

	.vip-area {
		background-image: url('/static/images/member/0.png');
		background-repeat: no-repeat;
		background-size: 100% 100%;
		height: 280rpx;
	}

	::-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
	}
</style>
