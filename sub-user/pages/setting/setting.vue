<template>
	<view class="container margin-lr">
		<use-navbar title="系统设置"></use-navbar>
		
		<view class="border-radius margin-top-sm">
			<use-list-title title="个人资料" iconfont=" " @goto="to('/sub-user/pages/setting/personal')"></use-list-title>
			<use-list-title v-if="!false" title="账号与安全" iconfont=" " @goto="to('/sub-user/pages/setting/account-security')"></use-list-title>
		</view>
		
		<view class="border-radius margin-top-sm">
			<use-list-title title="意见反馈" iconfont=" " @goto="to('/sub-user/pages/setting/feedback')"></use-list-title>
			<use-list-title :title="aboutName" iconfont=" " @goto="to('/sub-user/pages/setting/about')" :tip="version"></use-list-title>
		</view>
		
		<view class="border-radius margin-top-sm">
			<view class="use-item log-out-btn tac" @click="tologin">
				<text>切换账号</text>
			</view>
		</view>
		
		<view class="border-radius margin-top-sm">
			<view class="use-item log-out-btn tac" @click="tologout">
				<text>退出登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	export default {
		data() {
			return {
			};
		},
		onLoad(options) {
			
		},
		computed: {
			...mapState(['member']),
			aboutName() {
				return '关于' + this.$config.appabbr;
			},
			version() {
				return '版本' + this.$config.version;
			}
		},
		methods: {
			...mapMutations(['logout']),
			to(url) {
				uni.navigateTo({
					url
				})
			},
			
			// 切换账号
			tologin(){
				this.$api.tologin();
			},
			// 退出登录
			tologout() {
				uni.showModal({
					content: '退出登录',
					success: (e) => {
						if (e.confirm) {
							this.$api.msg('退出成功');
							this.logout();
							
							this.$api.timerout(() => {
								this.$api.tohome();
							}, 200);
						}
					}
				});
			}
		}
	}
</script>

<style lang='scss'>
	page {
		background: $page-color-base;
	}

	.use-item {
		height: 100rpx;
		line-height: 100rpx;
		position: relative;
		background: #fff;
		
		switch {
			transform: translateX(16rpx) scale(.84);
		}
		
		button {
			line-height: 100rpx;
			background: #fff;
			font-size: 15px;
		}
	}
</style>
