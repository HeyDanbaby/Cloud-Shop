<template>
	<view class="padding-sm pos-r">
		<use-navbar title="常见问题"></use-navbar>
		
		<scroll-view scroll-x class="ws-np">
			<view class="dflex">
				<block v-for="(item, idx) in typeDatas" :key="idx" >
				<view class="pos-r padding-tb-sm margin-right-xs padding-lr-sm line-height-1 tac" :class="{ active: activeId === idx }" @click="onQuery(item, idx)">
					{{item}}
				</view>
				</block>
			</view>
		</scroll-view>
		
		<view v-if="datas && datas.length > 0" class="bg-main padding padding-bottom-sm border-radius margin-top-sm">
			<view class="dflex-b border-line padding-bottom-sm">
				<view class="fwbd fs-30">猜你想问</view>
				<view class="dflex ft-dark">
					<view class="fs-xs"></view>
					<view class="iconfont iconjiantou-01 fs-xs margin-left-xs"></view>
				</view>
			</view>
			<view class="dflex-b padding-tb-sm" v-for="(item, idx) in faqDatas" :key="idx" @click="toContent(item)">
				<view class="">{{item.title}}</view>
				<view class="iconfont iconjiantou-01 fs-xs margin-left-xs ft-dark"></view>
			</view>
		</view>
		
		<!-- #ifdef MP-WEIXIN -->
		<view class="pos-f padding-tb-16 bg-main pos-b-full">
			<button class="dflex-c bg-main w-full" open-type="contact">
				<view class="iconfont iconkefu-01"></view>
				<view class="margin-left-xs fs-xs">联系官方客服</view>
			</button>
		</view>
		<!-- #endif -->
		
		<!-- #ifdef MP-ALIPAY -->
		<!-- 需自行配置支付宝小程序客服参数 -->
		<view class="fixed-top dflex-c dflex-flow-c">
			<contact-button tnt-inst-id="0Xu_1zzW" scene="SCE00225463" size="50" color="#bbb" />
		</view>
		<!-- #endif -->
	</view>
</template>

<script>
	const __name = 'usemall-app-faq';
	export default {
		data() {
			return {
				type: '',
				activeId: 0,
				typeDatas: [],
				faqDatas: [],
				datas: []
			};
		},
		onLoad(options) {
			console.log('options', options);
			this.type = options.type;
			this.loadData();
		},
 		methods: {
			loadData() {
				
				this.$db[__name].where({ state: '启用' }).tolist().then(res => {
					if (res.code == 200) {
						this.datas = res.datas;
						this.faqDatas = res.datas;
						this.typeDatas = ['全部', ...new Set(this.datas.map(x => x.type))];
						
						this.activeId = this.typeDatas.findIndex(x => x == this.type) || 0;
						if (this.activeId <= 0) {
							this.activeId = 0;
						} 
						else {
							this.onQuery(this.type, this.activeId);
						}
					}
				})
				
			},
			toContent(item) {
				const content = `<div class="__rich_text">${item.content.replace(/<h1/gi, '<h1 class="use-p"').replace(/<h3/gi, '<h3 class="use-p"').replace(/<p/gi, '<p class="use-p"')}</div>`;
				
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
			onQuery(item, idx) {
				this.activeId = idx;
				
				this.faqDatas = this.datas.filter(x => x.type == item || item == '全部');
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #F5F5F5;

		button::after {
			border: none
		}
		
		.active {
			color: #ff6a6c;
			font-weight: bold;
			font-size: 34rpx;
		}
		
	}
</style>
