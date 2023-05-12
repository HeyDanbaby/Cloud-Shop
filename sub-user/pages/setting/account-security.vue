<template>
	<view class="container margin-lr">
		<use-navbar title="账号安全"></use-navbar>
		
		<view class="dflex-c pos-r margin-bottom margin-top">
			<view class="portrait-box">
				<image class="border-radius-c" :src="member.member_headimg || '/static/images/user/default.png'">
				</image>
			</view>
			<view class="margin-left-sm">
				<view>
					<text class="username">{{ member.member_nickname || appabbr || '用云' }}</text>
				</view>
				<view v-if="member.slogan"><text class="fs-xxs">{{ member.slogan }}</text></view>
				<view v-else-if="member.member_city"><text class="fs-xxs">{{ member.member_city }}</text></view>
			</view>
		</view>
		
		<view class="border-radius">
			<use-list-title title="手机号" iconfont=" " rightIcon=" " :tip="member.member_mobile"></use-list-title>
			<use-list-title :title="passwordName" iconfont=" " tip="已设置" @goto="toForgetPassword"></use-list-title>
			<!-- #ifdef APP -->
			<!-- <use-list-title title="实名认证" iconfont=" " @goto="toRealname" tip="未认证"></use-list-title> -->
			<!-- #endif -->
		</view>
		
		<view class="margin-top margin-left-sm fwb">账号绑定</view>
		<view class="border-radius margin-top-sm">
			<!-- #ifndef MP-ALIPAY -->
			<use-list-title title="微信" iconfont=" " :tip="wxBindState" @goto="toBindWeixin"></use-list-title>
			<!-- #endif -->
			<!-- #ifdef APP -->
			<!-- <use-list-title title="指纹" iconfont=" " tip="未设置"></use-list-title> -->
			<!-- #endif -->
			<!-- #ifdef APP || MP-ALIPAY -->
			<use-list-title title="支付宝" iconfont=" " tip="未设置"></use-list-title>
			<!-- #endif -->
			<!-- #ifdef APP -->
			<!-- <use-list-title v-if="isiOS" title="Apple" iconfont=" " tip="已设置"></use-list-title> -->
			<!-- #endif -->
		</view>
		
		<!-- <view class="margin-top margin-left-sm fwb">其它</view>
		<view class="border-radius margin-top-sm">
			<use-list-title title="账号注销" iconfont=" " tip="数据无法恢复"></use-list-title>
		</view> -->
		
		<view class="padding"></view>
	</view>
</template>

<script>
	// #ifdef APP-PLUS
	let weixinAuthService;
	// #endif
	
	import { mapState, mapMutations } from 'vuex';
	export default {
		computed: {
			...mapState(['islogin', 'member']),
			appabbr() {
				return this.$config.appabbr;
			},
			passwordName() {
				return this.appabbr + '密码';
			}
		},
		data() {
			return {
				isiOS: false,
				wxBindState: ''
			};
		},
		onLoad() {
			this.$api.get_env(res => {
				this.isiOS = res.os && res.os.name == 'ios';
			});
			
			// #ifdef APP-PLUS
			plus.oauth.getServices((services) => {
				weixinAuthService = services.find((service) => {
					return service.id === 'weixin'
				})
			});
			// #endif
			// 加载微信绑定状态
			this.loadWeixinState();
		},
		onShow() {
			if (!this.islogin) {
				this.$api.msg('账号未登录');
				return;
			}
		},
		methods:{
			...mapMutations(['putMember']),
			toRealname() {
				
			},
			loadWeixinState() {
				// 微信绑定数据
				const weixin = this.member.member_weixin;
				
				// #ifdef APP
				this.wxBindState = weixin && weixin.app ? '已绑定' : '未绑定'; 
				return;
				// #endif
				
				// #ifdef MP-WEIXIN
				this.wxBindState = weixin && weixin.mp ? '已绑定' : '未绑定';
				return;
				// #endif
				
				// #ifdef H5-WEIXIN
				this.wxBindState = weixin && weixin.h5 ? '已绑定' : '未绑定';
				return;
				// #endif
				
				this.wxBindState = weixin && (weixin.app || weixin.mp || weixin.h5) ? '已绑定' : '未绑定';
			},
			async getWeixinCode() {
				return new Promise((resolve, reject) => {
					// #ifdef MP-WEIXIN
					uni.login({
						success: res => {
							console.log('uni.login', res);
							resolve(res.code);
						}
					});
					// #endif
					// #ifdef APP
					weixinAuthService.authorize((res) => {
						console.log('app authorize res', res);
						resolve(res.code)
					}, (err) => {
						console.log('app authorize err', err);
						reject(new Error('微信登录失败'))
					});
					// #endif
				})
			},
			async toBindWeixin() {
				// #ifdef APP || MP-WEIXIN
				uni.showModal({
					title: '提示',
					content: this.wxBindState === '已绑定' ? '解绑微信账号' : '绑定微信账号',
					success: (mres) => {
						if (mres.cancel) {
							return;
						} 
						
						if (this.wxBindState === '已绑定') {
							// 解绑微信
							this.unbindWeixin();
							return;
						}
						// 绑定微信
						this.bindWeixin();
					}
				});
				return;
				// #endif
				
				this.$api.msg('当前环境不支持此操作');
			},
			async bindWeixin() {
				const code = await this.getWeixinCode();
				
				uni.showLoading({
					title: '绑定中'
				});
				this.$func.usemall.call('member/bindWeixin', {
						sharemid: uni.getStorageSync('__use_share_mid') || '',
						// #ifdef APP-PLUS
						from: 'app',
						// #endif
						// #ifdef MP
						from: 'mp',
						// #endif
						wxcode: code
					})
					.then(res => {
						console.log('bindWeixin', res);
						uni.hideLoading();
						if (res.code == 200) {
							this.member.member_weixin = res.datas.member_weixin;
							
							this.loadWeixinState();
							this.putMember(this.member);
							return;
						}
						
						this.$api.alert(res.msg);
					});
			},
			async unbindWeixin() {
				const code = await this.getWeixinCode();
				
				uni.showLoading({
					title: '解绑中'
				});
				this.$func.usemall.call('member/unbindWeixin', {
						sharemid: uni.getStorageSync('__use_share_mid') || '',
						// #ifdef APP-PLUS
						from: 'app',
						// #endif
						// #ifdef MP
						from: 'mp',
						// #endif
						wxcode: code
					})
					.then(res => {
						console.log('unbindWeixin', res);
						uni.hideLoading();
						if (res.code == 200) {
							this.member.member_weixin = res.datas.member_weixin;
							
							this.loadWeixinState();
							this.putMember(this.member);
							return;
						}
						
						this.$api.alert(res.msg);
					});
			},
			toForgetPassword() {
				// 忘记密码
				uni.navigateTo({
					url: '/sub-user/pages/setting/modify-password'
				});
			}
		}
	}
</script>

<style lang='scss'>
	page {
		background: $page-color-base;
	}

	image {
		width: 130rpx;
		height: 130rpx;
	}

	.use-item {
		height: 100rpx;
		line-height: 100rpx;
		position: relative;
		background: #fff;
	}
</style>
