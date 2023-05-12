<template>
	<view>
		<!-- #ifndef MP-ALIPAY -->
		<use-navbar ref="navbar" title=" " :show="true" left-icon="icontubiaozhizuomoban-11 fs-xxl" :bg-color="navbarBgcolor"></use-navbar>
		<!-- #endif -->

		<!-- 01. 轮播区 -->
		<view class="swiper-area w-full pos-f" :style="{ 'margin-top': statusHeight }">
			<swiper class="h-full pos-r" indicator-dots circular="true" duration="400">
				<swiper-item v-for="(item, idx) in swiperDatas" :key="idx">
					<view class="wh-full">
						<image :src="item" class="wh-full loaded" lazy-load="true" mode="aspectFill" @click="preview(swiperDatas, item.url)"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>
		
		<view class="goods-area padding-lr-sm bg-drak border-radius-top30" :style="{ 'margin-top': statusHeight }">

			<!-- 02. 商品数据区 -->
			<view class="use-area margin-t0 padding-r0">
				<view class="dflex-b">
					<view class="dflex">
						<view class="ft-base fs-xxs">
							<text class="fwb fs-lg margin-right-xs">{{ goods.integral }}</text>积分
						</view>
						<text class="fs-xxs ft-dark" v-if="goods.price > 0"><text class="m-price">{{ goods.price / 100 || '' }}</text></text>
					</view>
					<view class="margin-right dflex ft-dark">
						<view class="padding-right-xs padding-right-xs">剩余:</view>
						<text>{{ goods.stock_num || '0' }}</text>
					</view>
				</view>
				
				<view class="margin-top padding-right">
					<text class="title fs fwb clamp-2">{{ goods.name || '' }} {{ goods.name_pw || '' }}</text>
				</view>

				<view class="margin-top-sm padding-right dflex-b ">
					<view class="padding-16 border-radius-sm bg-drak dflex-c">
						<text class="iconfont iconjifen-01 ft-base margin-right-xs line-height-0"></text>
						<text v-if="!islogin" @click="$api.tologin()">登录查看积分</text>
						<text v-else class="fs-xs">当前剩余<text class="ft-base">{{ $api.format_number(member.member_integral) }}</text>积分</text>
					</view>
					<view v-if="goods.exchange == 1" class="margin-right dflex ft-dark">
						<view class="padding-right-xs padding-right-xs">兑换:</view>
						<text>{{ goods.exchange_cnt || '0' }}</text>
					</view>
				</view>
			</view>

			<!-- 05. 评价区 -->
			<view class="use-area evaluate-area" v-if="evaluateDatas.length > 0">
				<view class="dflex-b use-hover" @click="toevaluate">
					<view class="dflex fwbd">{{evaluateTitle}}</view>
					<view class="dflex-c">
						<view class="margin-right-xs ft-dark">查看全部</view>
						<view class="iconfont iconjiantou-01 fs-sm ft-dark"></view>
					</view>
				</view>
				<view class="margin-top" :class="{ 'border-line': idx < evaluateDatas.length - 1 }"
					v-for="(item, idx) in evaluateDatas" :key="idx"
					@click="toevaluate">
					<view class="dflex-b">
						<view class="dflex">
							<image class="headimg border-radius-c" :src="item.member_headimg"></image>
							<view class="right-area flex1 padding-left-sm">
								<view class="margin-right">
									<view class="fwbd">{{ item.member_name }}</view>
									<use-rate class="line-height-1" icon-size="fs" :value="item.review_cnt" disabled></use-rate>
								</view>
							</view>
						</view>
						<text class="time ft-dark fs-xs">{{ $api.format(item.create_time, 'yyyy/MM/dd') }}</text>
					</view>
					<view class="content-area margin-top-xs">
						<view class="ft-main margin-top-xs margin-bottom-sm clamp-2">{{ item.review_content }}</view>
						<view class="dflex dflex-wrap-w">
							<view v-for="(img, i) in item.review_imgs" :key="i" class="dflex-c image-area overflow-hidden">
								<image :src="img" lazy-load mode="widthFix" @click.stop="preview(item.review_imgs, img)"></image>
							</view>
						</view>
						<view v-if="item.goods_type" class="padding-bottom-sm">
							<text class="fs-xxs ft-dark">{{ item.goods_type }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 06. 详情区 -->
			<view class="use-area detail-area bg-main">
				<view class="fwbd dflex">商品介绍</view>
				<rich-text class="pro-detail" :nodes="html_nodes"></rich-text>
			</view>
			
			<view class="safe-area-inset-bottom" style="height: 200rpx;"></view>
		</view>

		<!-- 07. 操作区 -->
		<view class="oper-area pos-f dflex-b w-full padding-lr-sm safe-area-inset-bottom">
			<view class="btn-area dflex dflex-flow-c use-hover" @click="tohome">
				<text class="iconfont iconshouye-1"></text>
				<text>首页</text>
			</view>
			
			<!-- <view class="btn-area dflex dflex-flow-c use-hover" @click="tochat">
				<text class="iconfont iconkefu-01"></text>
				<text>客服</text>
			</view> -->

			<!-- #ifdef MP-WEIXIN -->
			<button class="btn no-border dflex use-hover" open-type="contact">
				<view class="btn-area dflex-c dflex-flow-c">
					<text class="iconfont iconkefu-01"></text>
					<text>客服</text>
				</view>
			</button>
			<!-- #endif -->

			<view class="flex1 btn-container dflex-b border-radius-big">
				<view class="tac padding-tb-sm flex1 bg-base use-hover" v-if="goods.stock_num > 0"
					@click="tobuy('buy')">立即兑换
				</view>
				<view class="tac padding-tb-sm flex1 bg-disabled" v-else>已售磐</view>
			</view>
		</view>

		<!-- #ifdef MP-ALIPAY -->
		<!-- 需自行配置支付宝小程序客服参数 -->
		<view class="fixed-top dflex-c dflex-flow-c">
			<contact-button tnt-inst-id="0Xu_1zzW" scene="SCE00225463" size="50" color="#bbb" />
		</view>
		<!-- #endif -->

		<!-- 置顶 -->
		<use-totop ref="usetop" :safe-area-inset-bottom="true" bottom="120"></use-totop>
	</view>
</template>

<script>
	// #ifdef MP-ALIPAY
	import aliParse from 'mini-html-parser2';
	// #endif

	import lPainter from '@/uni_modules/lime-painter/components/lime-painter/';
	import uposter from '@/common/poster.js';

	import { mapState } from 'vuex';
	
	export default {
		components: {
			lPainter
		},
		computed: {
			...mapState(['islogin', 'member'])
		},
		data() {
			return {
				statusHeight: '0px',
				navbarBgcolor: 'rgba(255,255,255, 0)',
				// 商品ID
				id: 0,
				// 分享ID
				mid: 0,
				// 商品数据
				goods: {},
				// 轮播图
				swiperDatas: [],
				// 商品评价
				evaluateDatas: [],
				evaluateTitle: '用户评价',
				// 操作类型
				operType: 'spec',
				// 商品详情
				html_nodes: '',

				scrollTop: 0,
				// 购买数量
				goods_num: 1
			};
		},
		onPageScroll(e) {
			if (e.scrollTop <= 500) this.navbarBgcolor = `rgba(255,255,255, ${e.scrollTop / 500})`;
			
			//this.scrollTop = e.scrollTop;
			this.$refs.usetop.change(e.scrollTop);
		},
		onLoad(options) {
			console.log('onload opts', options);

			if (options) {
				this.mid = options.mid || '';
				if (options.id) {
					this.id = options.id;
				} else if (options.q) {
					let query = decodeURIComponent(options.q) || decodeURIComponent(uni.getStorageInfoSync('__scene_query_q'));
					this.resolveQueryq(query);
				}
			}

			if (!this.id) {
				this.$api.msg('商品ID无效');
				return;
			}
		},
		onShow(options) {
			if (!this.id) {
				const query = decodeURIComponent(uni.getStorageInfoSync('__scene_query_q'));
				this.resolveQueryq(query);
			}

			this.loadData();
		},

		methods: {
			async loadData() {

				await this.$func.usemall
					.call('integral/goodsDetail', {
						goods_id: this.id,
						share_mid: this.mid
					})
					.then(res => {
						if (res.code === 200) {
							// 商品评价
							this.evaluateDatas = res.datas.evaluate;
							if (res.datas.evaluate_cnt) this.evaluateTitle = `用户评价（${res.datas.evaluate_cnt}）`;

							if (typeof res.datas.goods.imgs === 'string') {
								this.swiperDatas = res.datas.goods.imgs.split(',').filter(x => x);
							} else {
								this.swiperDatas = res.datas.goods.imgs.map(x => x.url);
							}
							
							// 商品
							this.goods = res.datas.goods;
							
							// 商品详情
							// #ifndef MP-ALIPAY
							this.html_nodes = this.goods.desc_mobile;
							// #endif

							// #ifdef MP-ALIPAY
							this.html_nodes = [];
							aliParse(this.goods.desc_mobile, (err, nodes) => {
								if (!err) {
									this.html_nodes = nodes;
								}
							});
							// #endif

							return;
						}
						this.$api.msg(res.msg);
					});
			},
			// 处理 query q 数据
			resolveQueryq(query) {
				const arr = query
					.split('/')
					.slice(-1)[0]
					.split('_');
				if (arr.length == 2) this.mid = arr[1];
				this.id = arr[0];
			},
			// 图片预览
			preview(imgs, cur) {
				if (!imgs) return;

				uni.previewImage({
					urls: imgs,
					current: cur,
					longPressActions: {
						itemList: ['发送给朋友', '保存图片', '收藏'],
						success: function(data) {
							console.log(res);
						},
						fail: function(err) {
							console.log(err);
						}
					}
				});
			},

			// 打开分享
			shareOpen() {
				if (!this.loginCheck()) return;

				this.shareShow = true;
			},
			// 创建海报
			createPoster() {
				this.shareShow = false;
				if (this.posterUrl) {
					this.posterShow = true;
					return;
				}
				uni.showLoading({
					title: '生成海报中'
				});

				// #ifdef MP
				// 此处的二维码内容，需自己在小程序端配置普通二维码规则
				this.posterQRcode = `https://usemall.use-cloud.com/wxmp-product/${this.goods._id}_${this.member._id}`;
				// #endif

				// #ifdef H5
				// 如果为 h5，二维码内容需配置为线上版本产品详情路径
				this.posterQRcode =
					`https://usemall-h5.use-cloud.com/#/sub-goods/pages/detail?id=${this.goods._id}&mid=${this.member._id}`;
				// #endif
			},
			// 海报二维码生成成功
			posterQRcodeResult(res) {
				// 获取产品海报数据
				this.posterData = uposter.getGoodsData(this.member, this.goods, res, this.$config);
				// console.log('this.posterData', this.posterData);

				this.posterShow = true;
			},
			// 海报生成完成
			posterSuccess(res) {
				this.posterUrl = res;

				uni.hideLoading();
			},
			// 保存海报
			posterSave() {
				if (this.posterUrl) {
					uni.showLoading({
						title: '保存中'
					})

					uni.saveImageToPhotosAlbum({
						filePath: this.posterUrl,
						success: function() {
							uni.hideLoading();

							uni.showToast({
								title: '海报保存成功',
								icon: 'success',
								duration: 2000
							});
						}
					});
				}
			},

			// 加入购物车|立即购买的数量
			numberChange(res) {
				this.goods_num = res.number;
			},
			// 评论
			toevaluate() {
				uni.navigateTo({
					url: `/sub-goods/pages/evaluate?id=${this.id}&type=integral`
				});
			},
			// 首页
			tohome() {
				this.$api.tohome();
			},
			// 客服
			tochat() {
				uni.navigateTo({
					url: `/sp-im/pages/chat`
				})
			},
			// 立即兑换
			tobuy(type) {
				if (!this.loginCheck()) return;
				this.operType = type;
				
				uni.navigateTo({
					url: `/sub-user/pages/integral/create?goods_id=${this.id}&goods_num=${this.goods_num}`
				});
			},
			// 检测是否已登录
			loginCheck() {
				if (!this.islogin) {
					let _this = this;
					uni.showModal({
						title: '授权登录',
						success: function(res) {
							if (res.confirm) {
								_this.$api.tologin();
							}
						}
					});
					return false;
				}

				return true;
			}
		},
		mounted() {
			// #ifndef MP-ALIPAY
			this.$nextTick(() => {
				this.statusHeight = this.$refs.navbar.navbarStatusHeight + 'px';
			})
			// #endif
		}
	};
</script>

<style lang="scss">
	page {
		padding-bottom: 120rpx;
	}

	contact-button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
	}

	.fixed-top {
		bottom: 230rpx;
	}

	/* 01. 轮播区 */
	.swiper-area {
		height: 720rpx;
		top: 0;
		z-index: 0;
	}

	/* 02. 商品数据区 */
	.goods-area {
		/*margin-top: 720rpx !important;*/
		padding-top: 20rpx;
		position: absolute;
		top: 720rpx;
		width: 100%;
		z-index: 1;

		.title {
			line-height: 42rpx;
		}
	}

	.dot {
		width: 6rpx;
		height: 6rpx;
		border-radius: 50%;
		background: #bbb;
		display: inline-block;
		position: relative;
		top: -6rpx;
	}

	.share-area {
		.vertical-line {
			right: 50%;
			height: 40%;
		}
	}

	/* 04. 服务区 */
	.icon-detail {
		right: 30rpx;
		top: 24rpx;
	}

	/* 05. 评价 */
	.evaluate-area {
		.headimg {
			flex-shrink: 0;
			width: 70rpx;
			height: 70rpx;
		}

		.content-area {
			.image-area {
				height: 200rpx;
				width: 30%;
				margin-right: 10rpx;
				margin-bottom: 10rpx;
				border: 1px solid #f5f5f5;
				
				image {
					width: 100%;
					height: 100%;
				}
			}
		}
	}

	/* 06. 详情区 */
	.detail-area {

		/* 产品详情 */
		.pro-detail {
			width: 100%;
			overflow: hidden;
			-webkit-touch-callout: none;

			img {
				width: 100%;
				max-width: 100%;
				overflow: hidden;
			}
		}

	}

	/* 07. 操作区 */
	.oper-area {
		left: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 0 20rpx 0 #f0f0f0;
		height: 100rpx;
		height: calc(env(safe-area-inset-bottom) + 100upx);
		z-index: 95;

		.btn-area {
			font-size: $font-sm;
			color: $font-color-base;
			width: 96rpx;

			.iconfont {
				font-size: 40rpx;
				line-height: 48rpx;
			}
		}
	}

</style>
