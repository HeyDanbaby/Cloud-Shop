<template>
	<view class="box-sizing-b w-full">
		<use-navbar :title="apptitle"></use-navbar>
		
		<!-- 01. 头部组件 -->
		<use-header :search-tip="searchTip" :search-auto="searchAuto" type="gray" @search="search"></use-header>

		<!-- 02. 轮播区 -->
		<view v-if="swiperDatas && swiperDatas.length > 0" class="swiper-area margin-lr-sm border-radius pos-r">
			<!-- 轮播组件 -->
			<swiper class="swiper w-full" :autoplay="autoplay" indicator-dots indicator-color="#f7f7f7" indicator-active-color="#ff6a6c"
				previous-margin="30px" next-margin="30px" circular
				:current="swiperIdx" @change="swiperChange">
				<swiper-item v-for="(item, idx) in swiperDatas" :key="idx" class="swiper-item wh-full box-sizing-b">
					<view class="wh-full animated-all" :style="{ 'transform': `scale(${swiperIdx == idx ? 1 : 0.93})` }" @click.stop="topage(item)">
						<image class="border-radius wh-full" mode="aspectFill" lazy-load :src="item.img" />
					</view>
				</swiper-item>
			</swiper>
		</view>

		<!-- 03. 分类区 -->
		<view v-if="categoryDatas && categoryDatas.length > 0" class="category-area use-area margin-lr-sm dgrid" style="grid-gap: 20rpx 20rpx" :style="{ 'grid-template-columns': `repeat(${parameter.classify_num}, 1fr)` }">
			<view v-for="(item, idx) in categoryDatas" :key="idx" class="category-item dflex dflex-flow-c margin-bottom-xs" @click="topage(item)">
				<image class="margin-bottom-xs" lazy-load :src="item.img"></image>
				<text class="tac clamp">{{ item.name }}</text>
			</view>
		</view>
		
		<!-- 04. 限时精选 -->
		<view class="limit-area use-area margin-lr-sm">
			<view class="use-list-title dflex-b w-full bg-main margin-bottom-sm" @click="limit">
				<view class="dflex">
					<view class="iconfont __left margin-right-sm icondaishouhuo-" :style="{ color: '#333' }"></view>
					<text :style="{fontSize: '32rpx', fontWeight: 600 }">限时精选</text>
				</view>
				<view class="dflex">
					<view class="iconfont iconjiantou-01 fs-sm" :style="{ color: '#c0c0c0' }"></view>
				</view>
			</view>
			
			<scroll-view class="" scroll-x>
				<view class="dflex">
					<view class="item pos-r margin-right-sm" v-for="(item, idx) in goodsLimitDatas" :key="idx"
						@click="togoods(item)">
						<image class="border-radius-sm" mode="aspectFill" lazy-load :src="item.img"></image>
						<text class="title clamp padding-bottom-xs">{{ item.name }}</text>
						<text class="price">{{ item.is_vip === '是' ? item.vip_price / 100 : item.price / 100 }}</text>
						<text v-if="item.is_vip === '是' ? item.price / 100 : item.market_price / 100" class="m-price">{{ item.is_vip === '是' ? item.price / 100 : item.market_price / 100 }}</text>
						
						<view v-if="item.is_vip === '是'" class="use-tag pos-a pos-top bg-base">会员价</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 05. 秒杀 -->
		<view v-if="seckillData && seckillData._id && seckillData.expires_time" class="limit-area use-area margin-lr-sm">
			<view class="use-list-title dflex-b w-full bg-main margin-bottom-sm" @click="toSeckill">
				<view class="dflex">
					<view class="iconfont __left margin-right-sm icondaishouhuo-" :style="{ color: '#333' }"></view>
					<text :style="{fontSize: '32rpx', fontWeight: 600 }">{{ '秒杀' }}</text>
				</view>
				<view class="dflex">
					<view class="margin-right-xs dflex-c">
						<use-count-down
							fontSize="24"
							separatorSize="24"
							color="#fff"
							bgColor="#3c3c3c"
							:showDays="true"
							separatorColor="#3c3c3c"
							separatorSpace="8"
							:timestamp="seckillData.expires_time"
							@end="removeData"
						></use-count-down>
					</view>
					<view class="iconfont iconjiantou-01 fs-sm" :style="{ color: '#c0c0c0' }"></view>
				</view>
			</view>
			
			<scroll-view class="" scroll-x>
				<view class="dflex">
					<view class="item pos-r margin-right-sm" v-for="(item, idx) in seckillData.goods_objs" :key="idx"
						@click="togoods(item, 'seckill')">
						<image class="border-radius-sm" mode="aspectFill" lazy-load :src="item.img"></image>
						<text class="title clamp padding-bottom-xs">{{ item.name }}</text>
						<text class="price">{{ item.price / 100 }}</text>
						<text class="o-price">{{ item.market_price / 100 }}</text>
						
						<view class="use-tag pos-a pos-top bg-base">秒杀价</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 06. 拼团 -->
		<view v-if="groupDatas && groupDatas.length" class="limit-area use-area margin-lr-sm">
			<view class="use-list-title dflex-b w-full bg-main margin-bottom-sm" @click="toGroup">
				<view class="dflex">
					<view class="iconfont __left margin-right-sm icondaishouhuo-" :style="{ color: '#333' }"></view>
					<text :style="{fontSize: '32rpx', fontWeight: 600 }">拼团</text>
				</view>
				<view class="dflex">
					
					<view class="iconfont iconjiantou-01 fs-sm" :style="{ color: '#c0c0c0' }"></view>
				</view>
			</view>
			
			<scroll-view class="" scroll-x>
				<view class="dflex">
					<view class="item pos-r margin-right-sm" v-for="(group, idx) in groupDatas" :key="idx"
						@click="togoods(group, 'group')">
						<image class="border-radius-sm" mode="aspectFill" lazy-load :src="group.goods_obj.img"></image>
						<text class="title clamp padding-bottom-xs">{{ group.goods_obj.name }}</text>
						<text class="price">{{ group.goods_price / 100 }}</text>
						<text class="o-price">{{ group.goods_obj.price / 100 }}</text>
						
						<view class="use-tag pos-a pos-top bg-base">{{group.group_num}}人团</view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<view class="gap"></view>
		<!-- 05. 热门推荐 -->
		<use-hot-goods ref="hotGoods" title-type="round" title="热门推荐"></use-hot-goods>

		<!-- 置顶 -->
		<use-totop ref="usetop" type="tabbar"></use-totop>

		<!-- #ifdef MP-WEIXIN -->
		<official-account @bindload="wxOAccountLoad" @binderror="wxOAccountErr"></official-account>
		<!-- #endif -->
	</view>
</template>

<script>
	import { mapState } from 'vuex';

	export default {
		computed: {
			...mapState(['member']),
			apptitle() {
				return this.$config.appname;
			}
		},
		data() {
			return {
				parameter: {
					classify_num: 4
				},
				// 头部参数
				searchAuto: !0,
				searchTip: '请输入搜索关键字',

				// 轮播区
				swiperDatas: [],
				// 金刚区分类
				categoryDatas: [],
				// 限时精选
				goodsLimitDatas: [],
				// 热门推荐
				goodsHotDatas: [],

				scrollTop: 0,
				swiperIdx: 0,
				autoplay: true,
				
				seckillData: {},
				groupDatas: []
			};
		},
		// 监听页面加载
		onLoad() {
			this.loadSeckillData();
			this.loadGroupData();
			
		},
		onPageScroll(e) {
			// this.scrollTop = e.scrollTop
			if (this.$refs.usetop) {
				this.$refs.usetop.change(e.scrollTop);
			}
		},
		// 监听页面显示。页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面
		onShow() {
			uni.getStorage({
				key: '__use_home',
				success: (res) => {
					res = res.data;
					
					// 轮播图
					this.swiperDatas = res.carousel || [];
					// 分类导航
					this.categoryDatas = res.category || [];
					// 限时精选
					this.goodsLimitDatas = res.limited || [];
					// 热门推荐
					// this.goodsHotDatas = res.hot || [];
					// 参数设置
					this.parameter = res.parameter || this.parameter;
				}
			})
			this.loadData();
			
			// 自动切换轮播
			this.autoplay = true;
			
			// #ifdef H5-WEIXIN
			// 初始化 h5wx
			this.h5wxInit();
			// #endif
		},
		onHide() {
			// 关闭自动切换轮播
			this.autoplay = false;
		},
		// 监听用户下拉刷新
		onPullDownRefresh() {
			this.loadData(() => {
				uni.stopPullDownRefresh();
			});
			
			this.loadSeckillData();
			this.loadGroupData();
			
			// 刷新查询第一页数据
			this.$refs.hotGoods && this.$refs.hotGoods.loadData('refresh');
		},
		onReachBottom() {
			this.$refs.hotGoods && this.$refs.hotGoods.loadData();
		},
		methods: {
			// 加载数据
			loadData(callback) {

				this.$func.usemall.call('app/mp/home', {
					rows: 8
				}).then(res => {
					console.log('app/home res', res);
					if (res.code === 200) {
						uni.setStorage({ key: '__use_home', data: res.datas });
						
						// 轮播图
						this.swiperDatas = res.datas.carousel || [];
						// 分类导航
						this.categoryDatas = res.datas.category || [];
						// 限时精选
						this.goodsLimitDatas = res.datas.limited || [];
						// 热门推荐
						// this.goodsHotDatas = res.datas.hot || [];
						// 参数设置
						this.parameter = res.datas.parameter || this.parameter;

						if (typeof callback === 'function') {
							// 数据加载完成回调函数
							callback();
						}

						// #ifdef H5 || MP-360
						// if (this.goodsLimitDatas.length > 0) {
						// 	this.$api.dom('.uni-scroll-view-content').children[0].style.width = (uni
						// 		.upx2px(260) * this.goodsLimitDatas.length) + 'px';
						// 	new this.$iscroll('.uni-scroll-view-content', {
						// 		scrollX: true,
						// 		click: true
						// 	});
						// }
						// #endif
					}
				});
			},
			// 秒杀数据
			loadSeckillData() {
				this.$func.usemall.call('marketing/seckill/data', {
				}).then(res => {
					console.log('seckill data', res);
					if (res.code === 200) {
						this.seckillData = res.datas || {};
					}
				});
			},
			// 拼团数据
			loadGroupData() {
				this.$func.usemall.call('marketing/groupbuy/datas', {
				}).then(res => {
					console.log('groupbuy datas', res);
					if (res.code === 200) {
						this.groupDatas = res.datas || [];
					}
				});
			},
			
			// 搜索回调函数
			search() {
				console.log('home search');
			},
			// 跳转页面
			topage(item) {
				// console.log('分类点击', item);
				if (item && item.type == '网页') {
					uni.navigateTo({
						url: `/pages/content/web?url=${item.url}`
					});
				} else if (item && item.type == '页面') {
					uni.navigateTo({
						url: `${item.url}`
					});
				} else {
					if (item.id) {
						uni.setStorage({
							key: '__goods_data',
							data: item
						});	
						this.$api.togoods({
							id: item._id
						});
					}
				}
			},
			// 商品详情
			togoods(res, type) {
				res.__type = type || '';
				
				const reqData = {
					id: res._id,
					__type: res.__type
				};
				switch (type){
					case 'seckill':
						res = {
							goods_obj: res,
							...this.seckillData
						} 
						
						// 商品ID
						reqData.id = res.goods_obj._id;
						// 秒杀ID
						reqData.seckill_id = this.seckillData._id;
						break;
					case 'group':
						// 商品ID
						reqData.id = res.goods_obj._id;
						// 拼团ID
						reqData.group_id = res._id;
						break;
					default:
						break;
				}
				
				uni.setStorage({
					key: '__goods_data',
					data: res
				});
				
				// 跳转商品详情
				this.$api.togoods(reqData);
			},
			// 限时精选
			limit() {
				// 跳转商品列表 - 限时精选类目
				this.$api.togoodslist({
					limited: 1
				});
			},
			// 秒杀
			toSeckill(){
				uni.navigateTo({
				    url: '/sub-marketing/pages/seckill'
				});
			},
			// 拼团
			toGroup(){
				uni.navigateTo({
					url: '/sub-marketing/pages/group'
				});
			},
			swiperChange(res) {
				// console.log('swiperChange', res, this.swiperIdx);
				if (res.detail) {
					this.swiperIdx = res.detail.current;
				}
			},
			// 已过期
			removeData(res) {
				if (this.seckillData && this.seckillData._id) {
					// 清除已过期数据
					this.seckillData = {};
				}
			},
			// 获取分享参数
			async getShare(req) {
				let mid = 0;
						
				if (this.member && this.member._id) {
					mid = this.member._id;
				}
				
				let title = this.$config.appname || '用云电商';
				let url = `/pages/tabbar/home?mid=${mid}`;
				let img = '';
				let desc = this.$config.appslogan || '用云 · 让开发更简单';
				
				if (req) {
					uni.showLoading({
						title: '分享中'
					});
				}
				
				const shareRes = await this.$db['usemall-app-share'].where({ is_delete: 0, state: '启用' }).tofirst();
				
				if (req) uni.hideLoading();
				
				if (shareRes.code == 200) {
					const shareObj = shareRes.datas;
					if (shareObj && shareObj._id) {
						title = shareObj.share_title;
						img = shareObj.share_img;
						desc = shareObj.share_desc;
					}
				}
				
				return {
					title,
					img,
					url,
					desc
				}
			},
			// #ifdef H5-WEIXIN
			// 初始化微信
			h5wxInit() {
				this.$h5wx.init({ url: location.href.split('#')[0] }, async (wx) => {
					let {
						title,
						img,
						desc
					} = await this.getShare(false);
					
					let mid = 0;
					if (this.member && this.member._id) {
						mid = this.member._id;
					}
					
					let url = 'https://usemall-h5.use-cloud.com';
					if (location.hostname !== 'localhost') {
						url = `${location.protocol}//${location.hostname}`;
					}
					url = `${url}?mid=${mid}`;
					
					// 自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
					wx.updateAppMessageShareData({ 
						title: title,
						desc: desc,
						// 分享链接，该链接域名或路径必须与当前页面对应的公众号 JS 安全域名一致
						link: url,
						imgUrl: img,
						success: function () {
							// 设置成功
							
						}
					});
					
					// 自定义“分享到朋友圈”及“分享到 QQ 空间”按钮的分享内容（1.4.0）
					wx.updateTimelineShareData({ 
						title: title,
						// 分享链接，该链接域名或路径必须与当前页面对应的公众号 JS 安全域名一致
						link: url, 
						imgUrl: img,
						success: function () {
							// 设置成功
						}
					});
				});
			},
			// #endif
		},
		// 用户点击右上角分享
		// https://uniapp.dcloud.io/api/plugins/share?id=showsharemenu
		onShareAppMessage: async function(ops) {
			const {
				title,
				url,
				img,
				desc
			} = await this.getShare(ops);
			
			return {
				title: title,
				path: url,
				imageUrl: img,
				desc: desc,
				success: function(res) {
					// 转发成功
					console.log('转发成功', res);
				},
				fail: function(res) {
					// 转发失败
					console.log('转发失败', res);
				}
			};
		}
	};
</script>

<style lang="scss">
	page {
		background: #f5f5f5;
	}
	
	/* 轮播图区 */
	.swiper-area {
		.swiper {
			height: 240rpx;
		}
	}

	/* 分类区 */
	.category-area {
		padding: 30rpx 10rpx 10rpx !important;

		.category-item {
			font-size: $font-sm + 2upx;
			color: $font-color-dark;
		}

		image {
			width: 90rpx;
			height: 90rpx;
		}
	}

	/* 限时精选区 */
	.limit-area {
		min-height: 240rpx;

		.item {
			width: 240rpx;

			image {
				width: 240rpx;
				height: 240rpx;
			}
		}
	}

	::-webkit-scrollbar {
		width: 0;
		height: 0;
		color: transparent;
		display: none;
	}
</style>
