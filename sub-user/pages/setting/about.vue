<template>
	<view class="container margin-lr">
		<use-navbar :title="apptitle"></use-navbar>
		
		<view class="dflex-c pos-r margin-bottom margin-top-xxl">
			<image src="/static/images/logo.png"></image>
		</view>
		<view class="dflex-c dflex-flow-c">
			<text class="fwb fs-lg">{{ config.appname || '用云电商' }}</text>
			<text class="ft-dark fs-xxs">{{ config.appslogan || '用云 · 让开发更简单' }}</text>
		</view>
		<view class="gap padding"></view>
		
		<view class="border-radius">
			<!-- #ifdef APP -->
			<use-list-title title="去评分" iconfont=" " @goto="toScore"></use-list-title>
			<view class="border-line"></view>
			<!-- #endif -->
			<use-list-title title="使用协议" iconfont=" " @goto="toAgreement('service')"></use-list-title>
			<use-list-title title="隐私政策" iconfont=" " @goto="toAgreement('privacy')"></use-list-title>
			<view class="border-line"></view>
			<use-list-title title="关于我们" iconfont=" " @goto="toAbout"></use-list-title>
		</view>
		
		<view class="border-radius margin-top-sm">
			<use-list-title title="版本更新" iconfont=" " @goto="toUpdate" :tip="config.version"></use-list-title>
			<use-list-title :title="officialName" iconfont=" " @goto="toWeb('https://www.use-cloud.com')" tip="www.use-cloud.com"></use-list-title>
		</view>
		
		<view class="pos-f pos-b-full dflex-c dflex-flow-c ft-dark fs-xxs margin-bottom-xl">
			<text>{{ config.appabbr }}公司 版权所有</text>
			<text>Copyright © 2020-{{new Date().getFullYear()}} Usecloud. All Rights Reserved.</text>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex';
	const _about = 'usemall-app-about'
	export default {
		computed: {
			...mapState(['islogin', 'member']),
			config() {
				return this.$config;
			},
			officialName() {
				return this.$config.appabbr + '官网';
			},
			apptitle() {
				return '关于' + this.$config.appabbr;
			}
		},
		data() {
			return {
				aboutData: {}
			};
		},
		onShow() {
			if (!this.islogin) {
				this.$api.msg('账号未登录');
				return;
			}
		},
		onLoad() {
			this.loadData();
		},
		methods:{
			loadData() {
				this.$db['usemall-sys-agreement'].where({
					type: '登录'
				}).tolist().then(res => {
					if (res.code == 200) {
						if (res.datas && res.datas.length > 0) {
							let service = res.datas.find(x => x.name == '使用协议');
							let privacy = res.datas.find(x => x.name == '隐私政策');
							uni.setStorage({
								key: '__service',
								data: service
							});
							uni.setStorage({
								key: '__privacy',
								data: privacy
							})
						}
					}
				});
				
				this.$db[_about].tofirst().then(res=>{
					if(res.code === 200){
						this.aboutData = res.datas;
						return
					}
				})
			},
			toScore() {
				this.$api.msg('去评分');
			},
			toAgreement(type) {
				uni.getStorage({
					key: '__' + type,
					success: (res) => {
						this.toContent(res.data);
					}
				})
			},
			// 关于我们
			toAbout() {
				if (this.aboutData.type == '网页') {
					this.toWeb(this.aboutData.url);
				} else if (this.aboutData.type == '内容') {
					uni.setStorage({
						key: '__rich_text',
						data: this.aboutData.content,
						success() {
							uni.navigateTo({
								url: '/pages/content/rich-text'
							})	
						}
					})
				} 
			},
			toUpdate() {
				this.$api.msg('当前为最新版本');
			},
			toContent(item) {
				const content =
					`<div class="__rich_text">${item.content.replace(/<h1/gi, '<h1 class="use-p"').replace(/<h3/gi, '<h3 class="use-p"').replace(/<p/gi, '<p class="use-p"')}</div>`;
			
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
			toWeb(url) {
				uni.navigateTo({
					url: `/pages/content/web?url=${url}`
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
		width: 100rpx;
		height: 100rpx;
	}
</style>
