<template>
	<view>
		<!-- #ifndef MP-ALIPAY -->
		<use-navbar ref="navbar" title=" " :show="true" left-icon="icontubiaozhizuomoban-11 fs-xxl"
			:bg-color="navbarBgcolor"></use-navbar>
		<!-- #endif -->

		<!-- 01. 轮播区 -->
		<view class="swiper-area w-full" :class="[ isapp ? '' : 'pos-f' ]" :style="{ 'margin-top': navbarHeight }">
			<swiper class="h-full" indicator-dots circular="true" duration="400" :current="swiperIdx" @change="swiperChange">
				<swiper-item v-if="goods.video && goods.video.url" class="dflex-c">
					<!-- #ifdef APP -->
					<view class="wh-full pos-r" @click="toVideo">
						<image :src="goods.video.poster" class="wh-full loaded" lazy-load mode="aspectFill"></image>
						<view class="iconfont iconbofang pos-a pos-tl-c ft-white fs-80"></view>
					</view>
					<!-- #endif -->
					
					<!-- #ifndef APP -->
					<view class="wh-full pos-r dflex-c" style="background: #000;" @click="toVideo">
						<video
							id="uVideo"
							:src="goods.video.url" 
							:poster="goods.video.poster" 
							:poster-for-crawler="goods.video.poster"
							:show-fullscreen-btn="false"
							:controls="false"
							:show-play-btn="false"
							:show-center-play-btn="false"
							:enable-progress-gesture="false"
							@ended="goods.video.pause = true"
							object-fit="cover"
							class="h-full"
							style="width: 100%;"></video>
						
						<view v-if="goods.video.pause" class="iconfont iconbofang pos-a pos-tl-c ft-white fs-80"></view>
					</view>
					<!-- #endif -->
				</swiper-item>
				<swiper-item v-for="(item, idx) in swiperDatas" :key="idx">
					<view class="wh-full">
						<image :src="item" class="wh-full loaded" lazy-load mode="aspectFill"
							@click="preview(swiperDatas, item)"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>

		<view class="goods-area padding-lr-sm bg-drak" :class="[ isapp ? '' : 'pos-a border-radius-top30' ]"
			:style="{ 'margin-top': 0 }">
			<!-- <view class="use-area margin-t0 margin-bottom-sm">
				活动区 限时免单/拼团活动/下单返现
			</view> -->
			
			<view v-if="['group', 'seckill'].includes(type)" class="use-area dflex ft-base margin-t0"
				style="background: #f5e7e6; padding: 26rpx 30rpx;">
				<view class="bg-warn ft-white border-radius-lg fs-xxs margin-right-xs" style="padding: 2rpx 16rpx">限时{{type=='group'? '拼团' : '秒杀'}}</view>
				
				<view class="dflex">
					<text>距{{type=='group'? '拼团' : '秒杀'}}结束还剩</text>
					<use-count-down
						ref="uCountDown"
						fontSize="28"
						separatorSize="24"
						color="#ff6a6c"
						bgColor="rgba(0,0,0,0)"
						:showDays="true"
						separatorColor="#ff6a6c"
						:timestamp="expiresTime"
						@end="removeData"
						></use-count-down>
				</view>
			</view>
			<block v-else>
			<view v-if="goods.vip && member.vip" class="use-area dflex-b fwb ft-base margin-t0"
				style="background: #f5e7e6;" @click="toMember">
				<view>{{appabbr}}VIP，尊享会员价权益</view>
				<view class="iconfont iconjiantou-01 fs-sm ft-dark"></view>
			</view>
			<view v-if="goods.vip && !member.vip" class="use-area dflex-b fwb ft-base margin-t0"
				style="background: #f5e7e6;" @click="toMember">
				<view>￥{{member_setting.vip_fees || '-'}}元开通年VIP会员，尊享5大权益</view>
				<view class="iconfont iconjiantou-01 fs-sm ft-dark"></view>
			</view>
			</block>

			<!-- 02. 商品数据区 -->
			<view class="use-area padding-r0" :class="[['group', 'seckill'].includes(type) || goods.vip ? '' : 'margin-t0']">
				<view class="dflex pos-r" style="align-items: flex-end;">
					<view class="dflex" style="align-items: flex-end;">
						<text v-if="goods_price_tag" class="use-tag bg-base margin-right-sm">{{ goods_price_tag }}</text>
						<text class="price fs-big">{{ goods_price }}</text>
					</view>
					<!-- 会员商品、秒杀或拼团活动显示原价 -->
					<view v-if="goods.vip || ['group', 'seckill'].includes(type)" class="margin-left-sm">
						<text class="ft-dark">原价</text>
						<text class="price fs ft-dark">{{ goods_m_price }}</text>
					</view>
					<view v-else-if="goods.market_price" class="m-price fs-xs ft-dark">{{ goods.market_price / 100 }}</view>
					
					<text v-if="type == 'group'"
						class="border-radius-left50 fs-xxs bg-base line-height-1 margin-right-xs pos-a"
						style="padding: 16rpx 24rpx; right: 0;">{{groupData.group_num}}人团</text>
				</view>
				<view class="margin-top padding-right dflex">
					<text class="title fs-30 fwbd clamp-2">{{ goods.name || '' }} {{ goods.name_pw || '' }}</text>
				</view>

				<view class="margin-top-sm padding-right dflex-b ">
					<view class="dflex-c">
						<view v-if="integral" class="dflex padding-16 border-radius-sm bg-drak">
							<text class="iconfont iconyixiaoshou margin-right-xs line-height-0"></text>
							<text class="fs-xs">购买可得<text class="ft-base">{{integral}}</text>积分</text>
						</view>
					</view>
					<view class="dflex ">
						<view v-if="goods.sale" class="margin-right dflex ft-dark">
							<view class="padding-right-xs padding-right-xs">销量:</view>
							<text>{{ goods.sale_cnt || '0' }}</text>
						</view>
						<view class="border-radius-lg bg-drak dflex-c use-hover" style="width: 60rpx; height: 60rpx;">
							<!-- #ifdef MP-WEIXIN || H5 || APP -->
							<view class="dflex-c wh-full" @click="shareOpen">
								<view class="iconfont iconfenxiang "></view>
							</view>
							<!-- #endif -->
							<!-- #ifdef MP-ALIPAY || MP-BAIDU || MP-QQ || MP-TOUTIAO -->
							<button class="btn no-border padding-0 fs-sm ft-dark" open-type="share">
								<view class=" dflex">
									<view class="iconfont iconfenxiang "></view>
								</view>
							</button>
							<!-- #endif -->
						</view>
					</view>
				</view>
			</view>

			<view class="use-area padding-tb-sm">
				<!-- 选规格 -->
				<view v-if="isSkus" class="dflex-b padding-tb-16 use-hover" @click="operType = 'spec';specShow = true">
					<view class="dflex">
						<view class="ft-dark" style="width: 90rpx">已选</view>
						<text class="">{{ spec || '请选择规格' }}</text>
					</view>
					<view class="iconfont iconjiantou-01 fs-sm ft-dark"></view>
				</view>

				<!-- 04.01 优惠券 -->
				<view class="dflex-b padding-tb-16 use-hover" @click="couponShow = true">
					<view class="dflex">
						<view class="ft-dark" style="width: 90rpx">优惠</view>
						<text class="">领取优惠券</text>
					</view>
					<view class="dflex-c">
						<view class="bg-base padding-lr-xs border-radius-lg fs-xxs margin-right-xs">去领取</view>
						<view class="iconfont iconjiantou-01 fs-sm ft-dark"></view>
					</view>
				</view>

				<!-- 04.02 服务标签 -->
				<view class="dflex-b padding-tb-16 use-hover" @click="openTag">
					<view class="dflex-s">
						<view class="ft-dark" style="width: 90rpx">服务</view>
						<view class="">
							<block v-for="(item, idx) in tagDatas.slice(0, 3)" :key="idx">
								<text v-if="idx > 0" class="dot margin-right-xs"></text>
								<text class="margin-right-xs">{{ item.name }}</text>
							</block>
						</view>
					</view>
					<view class="dflex-c">
						<view class="iconfont iconjiantou-01 fs-sm ft-dark"></view>
					</view>
				</view>
			</view>
			
			<!-- 已参团列表 -->
			<view v-if="type == 'group' && groupChiefDatas.length" class="use-area padding-tb-sm pos-r overflow-hidden">
				<view class="dflex-b ft-base pos-a pos-t-full padding-tb-sm padding-lr" style="background-color: #f5e7e6;">
					<text>{{groupChiefDatas.length}}人在拼单，可直接参与</text>
					<view class="iconfont iconjiantou-011 fs-sm ft-base"></view>
				</view>
				<view class="padding-sm w-full"></view>
				
				<block v-for="(item, idx) in groupChiefDatas" :key="idx">
				<!-- .slice(0, 2) -->
				<view v-if="item.timestamp > 0" class="dflex-b margin-top">
					<view class="dflex">
						<image mode="aspectFit" class="headimg image-80 border-radius-c" 
							:src="item.member_headimg || '/static/images/logo.png'"></image>
						<text class="margin-left-xs">{{ item.member_name }}</text>
					</view>
					<view class="dflex">
						<view class="margin-right-sm tar">
							<text class="ft-base fs-xxs pos-r" style="right: 4rpx;">还差{{item.group_num - item.group_members.length}}人成团</text>
							<view class="fs-xxs dflex scale-09 line-height-1" style="transform-origin: right top;">
								<text class="margin-lr-xs">剩余</text>
								<use-count-down
									fontSize="24"
									separatorSize="24"
									color="#333"
									bgColor="rgba(0,0,0,0)"
									:showDays="true"
									separatorColor="#333"
									:timestamp="item.timestamp"
									@end="removeData"
									></use-count-down>
							</view>
						</view>
						<view class="border-radius-big dflex-c fs-xs bg-base" @click="toJoin(item)" style="width: 120rpx; height: 56rpx;">{{ item.member_uid == member._id ? '邀请' : '参团' }}</view>
					</view>
				</view>
				</block>
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
							<image class="headimg border-radius-c" :src="item.member_headimg || '/static/images/user/default.png'"></image>
							<view class="right-area flex1 padding-left-sm">
								<view class="margin-right">
									<view class="fwbd">{{ item.member_name }}</view>
									<use-rate class="line-height-1" icon-size="fs" :value="item.review_cnt" disabled>
									</use-rate>
								</view>
							</view>
						</view>
						<text class="time ft-dark fs-xs">{{ $api.format(item.create_time, 'yyyy/MM/dd') }}</text>
					</view>
					<view class="content-area margin-top-xs">
						<view class="ft-main margin-top-xs margin-bottom-sm clamp-2">{{ item.review_content }}</view>
						<view class="dflex dflex-wrap-w">
							<view v-for="(img, i) in item.review_imgs" :key="i" class="dflex-c image-area border-radius">
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
				<!-- <view class="fwbd dflex">商品介绍</view> -->
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
				<text>Usekf</text>
			</view> -->

			<!-- #ifdef MP-WEIXIN -->
			<button class="btn no-border dflex use-hover" open-type="contact">
				<view class="btn-area dflex-c dflex-flow-c">
					<text class="iconfont iconkefu-01"></text>
					<text>客服</text>
				</view>
			</button>
			<!-- #endif -->

			<view v-if="!['group', 'seckill'].includes(type)" class="btn-area dflex dflex-flow-c use-hover" :class="{ active: favorite }" @click="tofavorite">
				<text class="iconfont" :class="favorite ? 'iconshoucang-' : 'iconshoucang-01'"></text>
				<text>收藏</text>
			</view>
			
			<!-- 秒杀或拼团活动模式 -->
			<view v-if="['group', 'seckill'].includes(type)" class="flex1 btn-container dflex-b border-radius-big">
				<view v-if="goods.stock_num && type == 'group'" class="dflex-c dflex-flow-c padding-tb-xs flex1 bg-warn use-hover ft-white" @click="tobuy('buy')">
					<text class="s-price line-height-1 ft-white">{{ goods.price / 100 }}</text>
					<text class="fs-xxs">单独购买</text>
				</view>
				<view v-if="goods.stock_num && ['group', 'seckill'].includes(type)" class="dflex-c dflex-flow-c padding-tb-xs flex1 bg-base use-hover" @click="tobuy('buy', 1)">
					<text class="s-price line-height-1 ft-white">{{ goods_price }}</text>
					<text class="fs-xxs">{{ type == 'seckill' ? '立即秒杀' : '发起拼团' }}</text>
				</view>
				<view v-if="goods.stock_num <= 0" class="tac padding-tb-sm flex1 bg-disabled">已售罄</view>
			</view>
			<!-- 常规下单模式 -->
			<view v-else class="flex1 btn-container dflex-b border-radius-big">
				<view v-if="goods.stock_num" class="dflex-c padding-tb-sm flex1 bg-warn use-hover" @click="tocart('cart')">
					<text v-if="icart" class="use-loading line-height-1"></text>
					<text v-else>加入购物车</text>
				</view>
				<view v-if="goods.stock_num" class="dflex-c padding-tb-sm flex1 bg-base use-hover" @click="tobuy('buy')">立即购买</view>
				<view v-else class="tac padding-tb-sm flex1 bg-disabled">已售罄</view>
			</view>
		</view>
		
		<!-- 邀请 -->
		<use-popup mode="bottom" bgclass=" " v-model="inviteShow">
			<view class="share-area margin border-radius bg-main">
				<view class="tac w-full padding-sm">邀请</view>
				<view class="padding-lr margin-bottom-xl dflex-b pos-r">
					<!-- #ifdef MP-WEIXIN || APP -->
					<button class="dflex-c dflex-flow-c no-border btn use-hover" style="color: #07c160"
						open-type="share" data-type="invite">
						<view class="iconfont iconweixin padding-lr-sm border-radius-c fs-xxxl"></view>
						<view class="dflex-c fs-sm ft-dark">微信好友</view>
					</button>
					<view v-if="false" class="vertical-line"></view>
					<!-- #endif -->
					<button v-if="false" class="dflex-c dflex-flow-c no-border btn ft-base use-hover" @click="createPoster">
						<view class="iconfont iconhaibao1 padding-lr-sm border-radius-c fs-xxxl"></view>
						<view class="dflex-c fs-sm ft-dark">生成海报</view>
					</button>
				</view>
			</view>
		</use-popup>
		<!-- 分享 -->
		<use-popup mode="bottom" bgclass=" " v-model="shareShow">
			<view class="share-area margin border-radius bg-main">
				<view class="tac w-full padding-sm">分享</view>
				<view class="padding-lr margin-bottom-xl dflex-b pos-r">
					<!-- #ifdef MP-WEIXIN || APP -->
					<button class="dflex-c dflex-flow-c no-border btn use-hover" style="color: #07c160"
						open-type="share" @click="toShare(0)">
						<view class="iconfont iconweixin padding-lr-sm border-radius-c fs-xxxl"></view>
						<view class="dflex-c fs-sm ft-dark">微信好友</view>
					</button>
					<view class="vertical-line"></view>
					<!-- #endif -->
					<button class="dflex-c dflex-flow-c no-border btn ft-base use-hover" @click="createPoster">
						<view class="iconfont iconhaibao1 padding-lr-sm border-radius-c fs-xxxl"></view>
						<view class="dflex-c fs-sm ft-dark">生成海报</view>
					</button>
				</view>
			</view>
		</use-popup>
		<use-popup mode="bottom" bgclass=" " v-model="posterShow" @close="">
			<view class="padding border-radius margin">
				<!-- <view v-if="!posterUrl" class="tac bg-main padding border-radius pos-a pos-l-c" style="bottom: 45vh">
					海报生成中，请稍等</view> -->
				<view class="w-full" style="height: 70vh">
					<image :src="posterUrl" class="wh-full" mode="aspectFit"></image>
				</view>

				<view class="padding padding-bottom-xs w-full">
					<view class="dflex-b">
						<!-- #ifdef MP || APP || APP-NVUE -->
						<view class="dflex-b w-full">
							<view class="tac padding-tb-sm bg-base use-hover flex1 border-radius-big"
								@click="posterSave">保存到相册</view>
							<!-- #ifdef APP || APP-NVUE -->
							<view class="iconfont iconweixin dflex-c border-radius-c margin-left"
								style="background-color: #07C160; color: #fff; width: 88rpx; height: 88rpx;"
								@click="toShare(2)"></view>
							<!-- #endif -->
						</view>
						<!-- #endif -->

						<!-- #ifdef H5 || MP-360 -->
						<view class="tac padding-tb-sm flex1 bg-base border-radius-big">长按图片保存到相册</view>
						<!-- #endif -->
					</view>
				</view>

				<view class="dflex-c" @click.stop="posterShow = false">
					<view class="iconfont iconguanbi fs-xxxl ft-white"></view>
				</view>
			</view>
		</use-popup>
		<!-- 海报二维码 -->
		<view class="qrcode tac padding-tb pos-f pos-tl-c">
			<use-qrcode :onval="true" :val="posterQRcode" :show="false" loading-text="生成海报中" qrsize="200"
				@result="posterQRcodeResult"></use-qrcode>
		</view>
		<!-- 海报 -->
		<view v-if="posterShow && !posterUrl" class="poster pos-f pos-tl-c padding">
			<l-painter custom-style="position: fixed;z-index: -1;top: -200vh;left: -100vw;" :board="posterData" isH5PathToBase64 isRenderImage @success="posterSuccess" />
		</view>

		<!-- 规格弹出框 -->
		<use-popup mode="bottom" bgclass=" " :close-icon="true" v-model="specShow">
			<view class="bg-main padding border-radius-top30 safe-area-inset-bottom"
				style="min-height: 66vh; max-height: 80vh;">
				<view class="dflex margin-top-xs">
					<!-- 当前选中的SKU图片 -->
					<image :src="sku.img || goods.img" style="width: 100rpx; height: 100rpx;" mode="aspectFill"></image>
					<view class="margin-left-sm">
						<view class="dflex" style="align-items: flex-end;">
							<text v-if="goods_price_tag" class="use-tag bg-base margin-right-sm">{{goods_price_tag}}</text>
							<view class="price fs-big">{{ goods_price }}</view>
							<view v-if="goods.vip || ['group', 'seckill'].includes(type)" class="margin-left-sm">
								<text class="ft-dark fs-xs">原价</text>
								<text class="price fs-xs ft-dark">{{ goods_m_price }}</text>
							</view>
						</view>
						<view class="use-tags margin-0 margin-top-sm">
							<view v-if="integral">返{{integral}}积分</view>
							<view>包邮</view>
						</view>
					</view>
				</view>
				<scroll-view v-if="goods && goods.skus" class="overflow-auto" style="max-height: 50vh;" scroll-y>
					<block v-for="(item, idx) in goods.skus.filter(x => x.enable && x.arrs && x.arrs.length > 0)" :key="idx">
						<view class="margin-tb-sm">
							<text class="fwbd">{{item.name}} ({{item.arrs.length}})</text>
						</view>
						<view class="dflex dflex-wrap-w">
							<view class="dflex margin-right-sm margin-bottom-sm use-hover"
								v-for="(spec, specIdx) in item.arrs" :key="specIdx" @click="specSelected(idx, specIdx)"
								:class="{ 'tag-base': item.curIdx === specIdx && ['spec', 'buy'].includes(operType), 'tag-warn': item.curIdx === specIdx && ['cart'].includes(operType), 'tag-gray': item.curIdx !== specIdx }">
								<view>
									{{spec}}
								</view>
							</view>
						</view>
					</block>
				</scroll-view>

				<view class="padding-tb-sm margin-top dflex-b pos-r">
					<view class="dflex pos-r" style="top: 10rpx;">
						<view class="">
							购买数量
						</view>
						<text class="margin-left-sm ft-dark fs-xs">库存{{goods.stock_num}}件</text>
					</view>
					
					<use-number-box direction="right" :min="1" :max="goods.limit || goods.stock_num || 1" 
						:value="goods_num" :is-max="goods_num >= goods.limit || !!goods.stock_num" :is-min="goods_num === 1"
						:disabled="goods_num >= goods.limit || !!goods.stock_num" @eventChange="numberChange">
					</use-number-box>
				</view>
				<view class="w-full" style="height: 160rpx;"></view>
				<view class="pos-a pos-b-full padding safe-area-inset-bottom-plus dflex-c">
					<!-- 秒杀或拼团活动模式 -->
					<view v-if="['group', 'seckill'].includes(type)" class="flex1 btn-container dflex-b border-radius-big margin-top" :style="{ 'max-width': type == 'seckill' ? '76vw' : '' }">
						<view v-if="goods.stock_num && type == 'group'" class="dflex-c dflex-flow-c padding-tb-xs flex1 bg-warn use-hover ft-white" @click="tobuy('buy')">
							<text class="s-price line-height-1 ft-white">{{ goods.price / 100 }}</text>
							<text class="fs-xxs">单独购买</text>
						</view>
						<view v-if="goods.stock_num && ['group', 'seckill'].includes(type)" class="dflex-c dflex-flow-c padding-tb-xs flex1 bg-base use-hover" @click="tobuy('buy', 1)">
							<text class="s-price line-height-1 ft-white">{{ goods_price }}</text>
							<text class="fs-xxs">{{ type == 'seckill' ? '立即秒杀' : '发起拼团' }}</text>
						</view>
					</view>
					<!-- 常规下单模式 -->
					<view v-else class="flex1 btn-container dflex-b border-radius-big margin-top">
						<view v-if="goods.stock_num" class="dflex-c padding-tb-sm flex1 bg-warn use-hover" @click="tocart('cart')">
							<text v-if="icart" class="use-loading line-height-1"></text>
							<text v-else>加入购物车</text>
						</view>
						<view v-if="goods.stock_num" class="dflex-c padding-tb-sm flex1 bg-base use-hover" @click="tobuy('buy')">立即购买</view>
					</view>
				</view>
			</view>
		</use-popup>

		<!-- 04.01 优惠券弹出层 -->
		<use-popup mode="bottom" bgclass=" " close-icon v-model="couponShow" @open="couponOpen">
			<!-- 优惠券区 -->
			<view class="coupon-area padding bg-drak border-radius-top30 safe-area-inset-bottom">
				<view class="tac fwbd w-full padding-lr  padding-top-xs padding-bottom fs-34">优惠券</view>
				<scroll-view scroll-y style="max-height: 60vh; min-height: 40vh;">
					<view v-for="(item, idx) in couponDatas" :key="idx" class="coupon-item bg-main pos-r fs-xs border-radius">
						<view class="content pos-r padding dflex-b">
							<view class="">
								<view class="margin-bottom-xs fs">{{ item.name }}</view>
								<view class="ft-dark">有效期至 {{ $api.format(item.end_time, 'yyyy-MM-dd') }}</view>
							</view>
							<view class="tar">
								<view v-if="item.type == '满减'" class="margin-bottom-xs price">{{ item.price / 100 }}
								</view>
								<view v-if="item.type == '折扣'" class="margin-bottom-xs discount">{{ item.price / 10 }}
								</view>
								<view v-if="item.order_amount > 0" class="ft-dark">满{{ item.order_amount }}可用</view>
								<view v-else class="ft-dark">不限</view>
							</view>

							<view class="circle l"></view>
							<view class="circle r"></view>
						</view>
						<view class="dflex-b">
							<text class="ft-dark padding-lr">{{ item.type }}</text>
							<text class="ft-base padding-tb-sm padding-lr" @click="couponReceive(item._id)">立即领取</text>
						</view>
					</view>
				</scroll-view>
			</view>
		</use-popup>

		<!-- 04.02 服务标签弹出层 -->
		<use-popup mode="bottom" bgclass=" " close-icon v-model="tagShow">
			<view class="bg-main border-radius-top30 safe-area-inset-bottom">
				<view class="tac fwbd w-full padding-lr padding-tb-xl fs-34">服务说明</view>
				<scroll-view scroll-y class="padding-lr-lg padding-bottom" style="max-height: 60vh;">
					<view v-for="(item, idx) in tagDatas2" :key="idx"
						class="margin-right-sm margin-top margin-bottom-xl dflex dflex-s">
						<view v-show="false" class="iconfont iconyiwancheng- fwbd fs ft-base margin-right-xs line-height-0"></view>
						<view>
							<view class="fs-30 fwbd line-height-0">{{ item.name }}</view>
							<view class="margin-top ft-dark-3">{{ item.remark }}</view>
						</view>
					</view>
				</scroll-view>
				<use-loading v-if="!(tagDatas2 && tagDatas2.length)"></use-loading>
				
				<view v-else class="padding w-full margin-top dflex-c">
					<view class="border-radius-big" style="width: 60vw;">
						<view class="padding-tb-sm dflex-c bg-base" @click="tagShow = false">确认</view>
					</view>
				</view>
			</view>
		</use-popup>
		
		<!-- 04.03 参团弹出层 -->
		<use-popup mode="center" bgclass=" " border-radius="26" close-icon v-model="joinShow">
			<view v-if="groupChief && groupChief._id" class="bg-main border-radius padding-xl" style="width: 80vw;">
				<view class="dflex-c ft-base w-full padding-lr padding-tb-xs line-height-1">还差{{groupChief.group_unmember_cnt}}人成团</view>
				<view class="dflex-c fs-xxs"></view>
				<view class="padding-lr-lg padding-top padding-bottom-xl margin-tb dflex-c">
					<view v-for="(item, idx) in groupChief.group_members" :key="idx" class="margin-right-xl dflex-c dflex-flow-c pos-r">
						<view class="pos-r dflex-c group-user">
							<image v-if="item.uheadimg" mode="aspectFit" class="headimg image-sm border-radius-c" :src="item.uheadimg"></image>
							<view v-else class="headimg image-sm border-radius-c dflex-c">
								<text class="iconfont iconchangjianwenti-01 fs-xxl line-height-1 ft-dark"></text>
							</view>
							
							<view v-if="item.state" class="fs-xxs pos-a pos-bottom line-height-1 border-radius-xs scale-09" 
								style="bottom: -10rpx; padding: 4rpx 6rpx; transform-origin: center;"
								:class="[ idx == 0 ? 'bg-base' : 'bg-trans' ]">{{ idx == 0 ? '团长' : item.state }}</view>
						</view>
						
						<view class="fs-xs margin-top-xs" :class="[ item.uid ? 'ft-base' : 'ft-dark' ]">{{item.uname}}</view>
					</view>
				</view>
				<view class="w-full dflex-c">
					<view class="border-radius-big dflex-c padding-tb-16 bg-base" @click="toJoinBuy()" style="width: 50vw;">立即参与</view>
				</view>
			</view>
		</use-popup>
		
		<use-video v-model="videoShow" :videoObj="goods.video" @exit="videoShow = false;"></use-video>

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

	import {
		mapState
	} from 'vuex';
	
	// 允许的请求参数名
	const allowParams = ['id', '__type', 'group_id', 'seckill_id', 'mid', 'admin'];

	export default {
		components: {
			lPainter
		},
		computed: {
			...mapState(['islogin', 'member']),
			goods_price() {
				// 拼团价
				if (this.type && this.group_id) {
					if (this.groupData && this.groupData.goods_obj) {
						return this.groupData.goods_price / 100;
					}
					
					return 0;
				} 
				
				// 秒杀价
				if (this.type && this.seckill_id) {
					if (this.seckillData && this.seckillData.goods_obj) {
						return this.seckillData.goods_obj.price / 100;
					}
					
					return 0;
				}
				
				// 会员价
				if (this.goods.vip) return this.goods.vip_price / 100;
				
				return this.goods.price / 100 || 0;
			},
			goods_m_price() {
				// 拼团活动，显示原价
				if (this.type && this.group_id) {
					if (this.groupData && this.groupData.goods_obj) {
						return this.groupData.goods_obj.price / 100;
					}
					
					return 0;
				} 
				
				// 秒杀活动，显示原价
				if (this.type && this.seckill_id) {
					if (this.seckillData && this.seckillData.goods_obj) {
						return this.seckillData.goods_obj.market_price / 100;
					}
					
					return 0;
				}
				
				// 会员商品，显示原价
				if (this.goods.vip) return this.goods.price / 100;
				
				return this.goods.market_price / 100
			},
			goods_price_tag() {
				if (['group', 'seckill'].includes(this.type)) {
					return this.type == 'group' ? '拼团价' : this.type == 'seckill' ? '秒杀价' : '';
				}
				
				if (this.goods.vip) {
					return '会员价';
				}
				
				return '';
			},
			// 预返积分
			integral() {
				if (!this.integral_setting || this.integral_setting.return_integral_ratio <= 0) {
					return 0;
				}
				// 按积分比例计算对应商品价格的积分值
				let integral = parseInt(this.goods_price * (this.integral_setting.return_integral_ratio));

				if (this.member.vip && this.member_setting && this.member_setting.vip_integral_mul > 0) {
					// 计算会员可享积分倍数
					integral *= this.member_setting.vip_integral_mul;
				}

				return integral;
			},
			appabbr() {
				return this.$config.appabbr;
			}
		},
		data() {
			return {
				navbarHeight: '0px',
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
				// SKU
				sku: {},
				skuDatas: [],
				isSkus: false,
				// 视频
				videoShow: false,
				// 分享
				shareShow: false,
				// 海报
				posterQRcode: '',
				posterUrl: '',
				posterShow: false,
				posterData: {},
				// 商品规格
				spec: '',
				specShow: false,
				specShowData: [],
				//优惠券
				couponShow: false,
				couponDatas: [],
				// 服务标签
				tagShow: false,
				tagDatas: [],
				tagDatas2: [],
				// 商品评价
				evaluateDatas: [],
				evaluateTitle: '用户评价',
				// 操作类型
				operType: 'spec',
				// 商品详情
				html_nodes: '',
				// 收藏
				favorite: false,

				scrollTop: 0,
				// 购买数量
				goods_num: 1,

				member_setting: {},
				integral_setting: {},

				isapp: false,
				swiperIdx: 0,
				
				// 类型
				// group 拼团
				// seckill 秒杀
				type: '',
				joinShow: false,
				joinData: {},
				
				// 秒杀ID
				seckill_id: '',
				seckillData: {},
				// 拼团ID
				group_id: '',
				groupData: {},
				groupChiefDatas: [],
				// 参团
				groupChief: {},
				expiresTime: 0,
				inviteShow: false,
				
				// 加入购物车中
				icart: false,
				// 管理后台预览模式 1
				admin: 0,
				curParam: {}
			};
		},
		watch: {
			goods(nv, ov) {
				console.log('goods watch', nv, ov);
				// #ifdef H5-WEIXIN
				this.h5wxInit();
				// #endif
			},
			sku(nv, ov) {
				console.log('sku watch', nv, ov);
				// 秒杀价
				
				// 拼团价
				
				// 会员价
				this.goods.vip_price = nv.vip_price || 0;
				// this.goods.vip = this.goods.vip_price > 0;

				this.goods.price = nv.price;
				this.goods.market_price = nv.market_price;
				this.goods.stock_num = nv.stock_num;
			}
		},
		onPageScroll(e) {
			if (e.scrollTop <= 500) this.navbarBgcolor = `rgba(255,255,255, ${e.scrollTop / 500})`;

			//this.scrollTop = e.scrollTop;
			this.$refs.usetop.change(e.scrollTop);
		},
		onLoad(options) {
			console.log('onload opts', options);

			if (options) {
				if (options.id) {
					this.id = options.id;
					this.curParam.id = options.id;
				} 
				
				if (options.q) {
					let query = decodeURIComponent(options.q) || decodeURIComponent(uni.getStorageSync('__scene_query_q'));
					// 解析二维码场景参数 q
					this.resolveQueryq(query);
				} else {
					this.mid = options.mid || '';
					this.type = options.__type || '';
					this.admin = options.admin || 0;
					
					this.curParam.__type = options.__type || '';
					this.curParam.admin = options.admin || 0;
					
					switch (this.type) {
						case 'seckill':
							this.seckill_id = options.seckill_id || '';
							this.curParam.seckill_id = options.seckill_id || '';
							break;
						case 'group':
							this.group_id = options.group_id || '';
							this.curParam.group_id = options.group_id || '';
							break;
						default:
							break;
					}
				}
			}

			if (!this.id) {
				this.$api.msg('商品ID无效');
				return;
			}
			
			uni.getStorage({
				key: '__goods_data',
				success: (res) => {
					console.log('__goods_data res', res);
					
					if (this.type == 'group') {
						// 拼团商品
						if (res.data.goods_obj && res.data.goods_obj._id == this.id) {
							res.data._id = '';
							res.data.goods_obj._id = '';
							
							this.setGroup({ group: res.data });
							this.setGoods({ goods: res.data.goods_obj });
						}
						return;
					}
					
					if (this.type == 'seckill') { 
						// 秒杀商品
						if (res.data.goods_obj && res.data.goods_obj._id == this.id) {
							res.data._id = '';
							res.data.goods_obj._id = '';
							
							this.setSeckill({ seckill: res.data });
							this.setGoods({ goods: res.data.goods_obj });
						}
						return;
					}
					
					if (res.data && res.data._id == this.id) {
						res.data._id = '';
						this.setGoods({goods: res.data});
					}
				}
			})
			
			this.loadData();
		},
		onShow(options) {
			uni.hideLoading();
			
			if (!this.id) {
				const query = decodeURIComponent(uni.getStorageSync('__scene_query_q'));
				this.resolveQueryq(query);
			}

			// 加载扩展数据
			this.loadDataEx();
			
			// #ifdef APP || APP-NVUE
			this.isapp = true;
			// #endif
		},
		methods: {
			loadData() {
				this.$func.usemall.call('goods/detailV2', {
						goods_id: this.id,
						share_mid: this.mid,
						seckill_id: this.seckill_id,
						group_id: this.group_id,
						admin: this.admin
					})
					.then(res => {
						console.log('goods/detailV2 res', res);
						if (res.code === 200) {
							this.setGoods(res.datas);
							if (this.type == 'group') {
								this.setGroup(res.datas);
								// 拼团限购数量为 1
								this.goods.limit = 1;
								// 参团列表
								this.loadJoinDatas();
							}
							if (this.type == 'seckill') {
								this.setSeckill(res.datas);
							}
							return;
						}
						this.$api.msg(res.msg);
					});
			},
			// 详情扩展数据
			loadDataEx() {
				this.$func.usemall.call('goods/detailEx', {
						goods_id: this.id,
						share_mid: this.mid,
						seckill_id: this.seckill_id,
						group_id: this.group_id,
						admin: this.admin
					})
					.then(res => {
						if (res.code === 200) {
							// 商品评价
							this.evaluateDatas = res.datas.evaluate;
							if (res.datas.evaluate_cnt) this.evaluateTitle = `用户评价（${res.datas.evaluate_cnt}）`;
							
							if (res.datas && res.datas.goods) {
								// 收藏状态
								this.favorite = res.datas.goods.collected === 1;
							}
							
							if (['seckill', 'group'].includes(this.type)) {
								// 删除数据
								delete res.datas.goods;
							}
							this.setGoods(res.datas);
							return;
						}
						this.$api.msg(res.msg);
					});
			},
			loadJoinDatas() {
				this.$func.usemall.call('marketing/groupbuy/joinList', {
						group_id: this.group_id
					})
					.then(res => {
						console.log('joinList res', res);
						if (res.code === 200) {
							this.groupChiefDatas = res.datas.filter(x => x.timestamp > 0);
							return;
						}
					});
			},
			setGoods(res) {
				if (res.goods) {
					if (typeof res.goods.imgs === 'string') {
						this.swiperDatas = res.goods.imgs.split(',').filter(x => x);
					} else {
						if (res.goods.imgs && res.goods.imgs.length) this.swiperDatas = res.goods.imgs.map(x => x.url);
					}
						
					if (res.goods.skus) {
						// 存在SKU
						res.goods.skus = res.goods.skus.filter(x => x.enable && x.arrs && x.arrs.length > 0);
						res.goods.skus.forEach(x => { 
							x.curIdx = 0; 
						});
					}
					
					if (res.goods.video && res.goods.video.url) {
						// 存在视频
						res.goods.video.pause = true;
						res.goods.video.loaded = false;
						
						if (this.init) {
							res.goods.video.pause = this.goods.video.pause;
							res.goods.video.loaded = this.goods.video.loaded;
						}
						
						this.init = true;
					}
					
					// 服务标签
					if (typeof res.goods.tags === 'string') {
						res.goods.tags = res.goods.tags.split(',').filter(x => x);
					}
					res.goods.vip = res.goods.is_vip === '是';
					
					// 商品
					this.goods = res.goods;
					this.isSkus = this.goods.skus && this.goods.skus.find(x => x.enable && x.arrs && x.arrs.length > 0);
					
					let __tagDatas = [];
					this.goods.tags && this.goods.tags.forEach((data, idx) => {
						__tagDatas.push({
							name: data,
							selected: idx == 0
						});
					});
					this.tagDatas = __tagDatas;
				}
				
				// 商品SKU
				this.skuDatas = res.goods_skus || [];
				// SKU
				if (this.skuDatas.length) {
					// 默认显示 SKU 最低价
					this.sku = this.skuDatas.sort((x1, x2) => {
						if (this.goods.vip) {
							return x1.vip_price - x2.vip_price;
						}
						return x1.price - x2.price;
					})[0];
					
					// 设置对应的 curIdx
					this.goods.skus.forEach((item, idx) => {
						item.curIdx = this.sku[`sku${idx+1}_idx`]; 
					});
					this.spec = this.goods.skus.map(x => x.arrs[x.curIdx]).filter(x => x).join(' & ');
					
					// this.sku = this.skuDatas[0];
					// this.spec = this.goods.skus.map(x => x.arrs[x.curIdx]).filter(x => x).join(' & ');
					// this.goods.stock_num = this.skuDatas.
				}
				
				// 商品详情
				let __goods_detail = res.goods_detail;
				if (__goods_detail) {
					// #ifndef MP-ALIPAY
					this.html_nodes = __goods_detail.desc_mobile;
					// #endif
					
					// #ifdef MP-ALIPAY
					this.html_nodes = [];
					aliParse(__goods_detail.desc_mobile, (err, nodes) => {
						if (!err) {
							this.html_nodes = nodes;
						}
					});
					// #endif
				}
				
				this.member_setting = res.member_setting || {};
				this.integral_setting = res.integral_setting || {};
			},
			// 秒杀数据
			setSeckill(res) {
				this.seckillData = res.seckill;
				console.log('this.seckillData', this.seckillData);
				this.expiresTime = res.seckill.expires_time;
			},
			// 拼团数据
			setGroup(res) {
				this.groupData = res.group;
				console.log('this.groupData', this.groupData);
				this.expiresTime = res.group.expires_time;
			},
			// 处理 query q 数据
			resolveQueryq(query) {
				let arr = [];
				if (query.includes('?')) {
					query = query.split('?')[1];
					const params = query.split('&');
					
					const obj = {};
					params.forEach(x => {
						if (x.includes('=')) {
							arr = x.split('=');
							obj[arr[0]] = arr[1];
						}
					});
					
					console.log('query q obj', obj);
					
					for (let key in obj) {
						if (key == '__type') {
							this.type = obj[key];
							this.curParam[key] = obj[key];
							continue;
						} 
						
						if (allowParams.includes(key)) {
							this[key] = obj[key];
							this.curParam[key] = obj[key];
						}
					}
					return;
				}
				
				arr = query
					.split('/')
					.slice(-1)[0]
					.split('_');
				if (arr.length == 2) this.mid = arr[1];
				
				this.id = arr[0];
				this.curParam.id = arr[0];
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
			swiperChange(res) {
				if (res.detail && res.detail.current !== 0 && this.uVideo) {
					this.uVideo.pause();
					this.uVideo.isplay = false;
					this.goods.video.pause = true;
				}
			},
			toVideo() {
				// #ifdef APP
				this.videoShow = true;
				return;
				// #endif
				// this.$api.msg('播放视频');
				
				if (!this.uVideo) this.uVideo = uni.createVideoContext('uVideo', this);
				if (this.uVideo.isplay) {
					this.uVideo.pause();
					this.uVideo.isplay = false;
					this.goods.video.pause = true;
					return;
				}
				this.uVideo.isplay = true;
				this.goods.video.pause = false;
				this.goods.video.loaded = true;
				this.uVideo.play();
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

				// #ifdef MP || APP
				// 此处的二维码内容，需自己在小程序端配置普通二维码规则
				this.posterQRcode = `https://usemall.use-cloud.com/wxmp-product/detail?${this.$api.getCurPageParam({ mid: this.member._id, ...this.curParam }, allowParams)}`;
				console.log('this.posterQRcode', this.posterQRcode);
				// #endif

				// #ifdef H5
				// 如果为 h5，二维码内容需配置为线上版本产品详情路径
				let url = 'https://usemall-h5.use-cloud.com';
				if (location.hostname !== 'localhost') {
					url = `${location.protocol}//${location.hostname}`;
				}
				url = `${url}/#/${this.$api.getCurPageFullUrl({ mid: this.member._id, ...this.curParam }, allowParams)}`;
				this.posterQRcode = url;
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
			// 分享好友WXSceneSession 或 朋友圈WXSceneTimeline
			async toShare(type, scene = "WXSceneSession") {
				console.log('toShare 1', this.posterUrl);
				if (type == 2 && !this.posterUrl) {
					this.$api.msg('海报生成中，请稍等');
					return;
				}

				uni.showLoading({
					title: '打开分享中'
				})
				let shareData = {
					type,
					scene
				};
				switch (type) {
					case 0:
						// 分享图文
						shareData.href = "http://usemall-h5.use-cloud.com?q=app";
						shareData.title = this.$config.appname || "用云电商";
						shareData.summary = `我正在[${shareData.title}]购买一款[${this.goods.name}]，赶紧跟我一起来体验！`;
						shareData.imageUrl = this.goods.img;
						break;
					case 2:
						// 分享图片
						shareData.imageUrl = this.posterUrl;
						if (this.posterUrl.indexOf('http') !== 0) {
							const uRes = await this.$api.uploadFile(this.posterUrl, `${Date.now()}.png`)
								.catch(err => {
									this.$api.msg(err.message);
									uni.hideLoading();
								});
							
							shareData.imageUrl = uRes.url;
							this.posterUrl = uRes.url;
						}
						break;
				}

				uni.share({
					...shareData,
					provider: "weixin",
					success: (res) => {
						console.log("success:", res);
					},
					fail: (err) => {
						console.log("fail:", err);
						this.$api.msg('分享失败，请重试');
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},

			// 选中规格
			specSelected(idx, specIdx) {
				this.goods.skus[idx].curIdx = specIdx;

				this.spec = this.goods.skus.map(x => x.arrs[x.curIdx]).filter(x => x).join(' & ');
				this.sku = this.skuDatas.map(x => {
					return {
						spec: [x.sku1_spec, x.sku2_spec, x.sku3_spec, x.sku4_spec].filter(s => s).join(' & '),
						sku: x
					}
				}).find(x => x.spec == this.spec).sku;
			},
			// 加入购物车|立即购买的数量
			numberChange(res) {
				this.goods_num = res.number;
			},
			// 打开优惠券
			couponOpen() {
				if (!this.loginCheck()) return;
				
				uni.showLoading({
					title: '加载中'
				});

				this.$func.usemall.call('marketing/coupon/receiveGoods', {
					goods_id: this.id
				}).then(res => {
					uni.hideLoading();

					if (res.code == 200) {
						this.couponDatas = res.datas;
						return;
					}

					this.$api.msg(res.msg);
				})
			},
			// 领券
			couponReceive(rule_id) {
				uni.showModal({
					title: '提示',
					content: '领取优惠券',
					success: (res) => {
						if (res.confirm) {
							this.$func.usemall.call('marketing/coupon/receive', {
								rule_id
							}).then(res => {
								if (res.code === 200) {
									this.$api.msg('领取成功');
									this.couponOpen();
									return;
								}

								this.$api.msg(res.msg);
							});
						}
					}
				});
			},
			// 评论
			toevaluate() {
				uni.navigateTo({
					url: `/sub-goods/pages/evaluate?id=${this.id}`
				});
			},
			// 首页
			tohome() {
				this.$api.tohome();
			},
			// 客服
			tochat() {
				uni.navigateTo({
					url: `/sub-kf/pages/chat`
				})
			},
			// 收藏
			tofavorite() {
				if (!this.loginCheck()) return;

				this.favorite = !this.favorite;
				let _data = {
					goods_id: this.id,
					state: !this.favorite ? '已取消' : '已收藏'
				};
				this.$func.usemall.call('member/collect', _data).then(res => {
					if (res.datas) {
						!this.favorite ? this.$api.msg('取消成功') : this.$api.msg('收藏成功');
						return;
					}

					this.$api.msg(res.msg);
				});
			},
			// 加入购物车
			tocart(type) {
				if (!this.loginCheck()) return;
				this.operType = type;

				// 如果存在多规格SKU，判断 specShow 是否已打开
				if (this.isSkus) {
					if (!this.specShow) {
						this.specShow = true;
						return;
					}

					if (!this.sku || !this.sku._id) {
						this.$api.msg('请选择加入购物车的规格');
						return;
					}
				}
				
				if (this.icart) return;
				this.icart = true;

				this.$func.usemall.call('goods/addcart', {
						goods_id: this.id,
						goods_num: this.goods_num,
						goods_sku: this.sku.goods_sku,
						goods_sku_id: this.sku._id
					})
					.then(res => {
						this.icart = false;
						if (res.code === 200) {
							this.$api.msg(res.datas.msg);
							this.specShow = false;
							return;
						}

						this.$api.msg(res.msg);
					});
			},
			// 立即购买
			tobuy(type, flag) {
				if (!this.loginCheck()) return;
				this.operType = type;

				// 如果存在多规格SKU，判断 specShow 是否已打开
				if (this.isSkus) {
					if (!this.specShow) {
						this.specShow = true;
						return;
					}

					if (!this.sku || !this.sku._id) {
						this.$api.msg('请选择购买的规格');
						return;
					}
				}
				
				let url = `/sub-goods/pages/order/create?goods_id=${this.id}&goods_num=${this.goods_num}&sku_id=${this.sku._id || ''}`;
				if (flag && (this.seckill_id || this.group_id)) {
					url = `/sub-goods/pages/order/create?goods_id=${this.id}&goods_num=${this.goods_num}&sku_id=${this.sku._id || ''}&seckill_id=${this.seckill_id}&group_id=${this.group_id}&expires_time=${this.$refs.uCountDown.nowdate}`;
				}
				
				uni.navigateTo({
					url: url
				});
				
				this.closeAllPupup();
			},
			// 检测是否已登录
			loginCheck() {
				if (!this.islogin) {
					this.$api.tologin();
					return false;
				}

				return true;
			},
			toMember() {
				if (this.member && this.member.vip) {
					uni.navigateTo({
						url: '/sub-user/pages/member/member'
					})
					return;
				}

				uni.navigateTo({
					url: '/sub-user/pages/member/member-not'
				})
			},
			toJoin(res) {
				console.log('toJoin res', res);
				// 参团
				this.groupChief = JSON.parse( JSON.stringify(res) );
				
				if (this.groupChief.member_uid == this.member._id) {
					// 成员一样，触发邀请
					this.inviteShow = true;
					return;
				}
				
				this.groupChief.group_unmember_cnt = this.groupChief.group_num - this.groupChief.group_members.length;
				for (let i = 0; i < this.groupChief.group_unmember_cnt; i++) {
					this.groupChief.group_members.push({
						uname: '待参团'
					});
				}
				
				this.joinShow = true;
				this.joinData = res;
			},
			toJoinBuy() {
				if (!(this.groupChief && this.groupChief._id)) {
					this.$api.msg('请选择对应的拼单');
					return;
				}
				
				let url = `/sub-goods/pages/order/create?goods_id=${this.id}&goods_num=${this.goods_num}&sku_id=${this.sku._id || ''}&group_id=${this.group_id}&group_chief_id=${this.groupChief._id}`;
				uni.navigateTo({
					url: url
				});
				
				this.closeAllPupup();
			},
			// 活动已结束
			removeData() {
				switch (this.type){
					case 'seckill':
						this.$api.alert('秒杀活动已结束', () => {
							this.$api.back();
						});
						break;
					case 'group':
						this.$api.alert('拼单活动已结束', () => {
							this.$api.back();
						});
						break;
					default:
						break;
				}
			},
			// 待参团已结束
			removeJoinData(res) {
				res.timestamp = 0;
				this.groupChiefDatas = this.groupChiefDatas.filter(x => x.timestamp > 0);
			},
			closeAllPupup() {
				if (this.specShow || this.couponShow || this.posterShow || this.shareShow || this.joinShow) {
					if (this.specShow) this.specShow = false;
					if (this.couponShow) this.couponShow = false;
					if (this.shareShow) this.shareShow = false;
					if (this.posterShow) this.posterShow = false;
					if (this.joinShow) this.joinShow = false;
					if (this.tagShow) this.tagShow = false;
					return true;
				} 
				
				return false;
			},
			openTag() {
				this.tagShow = true;
				
				if (this.tagDatas2 && this.tagDatas2.length) {
					return;
				}
				
				this.$db['usemall-goods-tag'].where({
					type: '服务',
					name: this.$dbcmd.in(this.tagDatas.map(x => x.name))
				}).tolist().then(res => {
					console.log('tags res', res);
					if (res.code == 200) {
						this.tagDatas2 = res.datas;
					}
				});
			},
			// 获取分享参数
			async getShare(req) {
				let mid = 0;
				if (this.member && this.member._id) {
					mid = this.member._id;
				}
				
				if (this.shareShow) this.shareShow = false;
				if (this.inviteShow) this.inviteShow = false;
				
				
				let img = this.goods.share_img || '';
				let title = this.goods.share_title || this.$config.appname || '用云电商';
				// "/page"开头，拼接好传递的参数
				let url = `/sub-goods/pages/detail?id=${this.id}&mid=${mid}`;
				
				if (req && req.target && req.target.dataset.type == 'invite') {
					if (this.groupChief && this.groupChief._id) {
						title = '我正在拼单，邀请您一起参与';
						url = `/sub-marketing/pages/group-join?id=${this.groupChief._id}&mid=${mid}`;
					}
				}
				let desc = this.$config.appslogan || '用云 · 让开发更简单';
				
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
				this.$h5wx.init({ 
					url: location.href.split('#')[0]
				}, async (wx) => {
					let {
						title,
						img,
						desc
					} = await this.getShare(false);
					
					console.log('h5wx init', {
						title,
						img,
						desc
					});
					
					let mid = 0;
					if (this.member && this.member._id) {
						mid = this.member._id;
					}
					
					let url = 'https://usemall-h5-wx.use-cloud.com';
					if (location.hostname !== 'localhost') {
						url = `${location.protocol}//${location.hostname}`;
					}
					url = `${url}/#/${this.$api.getCurPageFullUrl({ mid: this.member._id, ...this.curParam }, allowParams)}`;
					
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
		mounted() {
			// #ifndef MP-ALIPAY
			this.$nextTick(() => {
				this.statusHeight = this.$refs.navbar.navbarStatusHeight + 'px';
				// #ifdef APP
				this.navbarHeight = -this.$refs.navbar.navbarHeight + 'px';
				// #endif
			})
			// #endif
		},
		onBackPress(options) {
			console.log('onBackPress', options);
			if (options.from === 'navigateBack') {
				return false;
			}
			
			return this.closeAllPupup();
		},
		onShareAppMessage: async function(ops) {
			console.log('onShareAppMessage', ops);
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
				success: function(res) {
					// 转发成功
					console.log('转发成功', res);
				},
				fail: function(res) {
					// 转发失败
					console.log('转发失败', res);
				}
			};
		},
	};
</script>

<style lang="scss">
	page {
		padding-bottom: 120rpx;
		background-color: #f5f5f5;
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
		height: 58vh;
		top: 0;
		z-index: 0;
	}

	/* 02. 商品数据区 */
	.goods-area {
		/*margin-top: 720rpx !important;*/
		padding-top: 20rpx;
		top: 58vh;
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

	/* 03. 规格区 */
	.sku-area .active {
		background: $base-color;
		color: #fff !important;

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
	
	.btn-container view {
		height: 80rpx;
	}

	/* 优惠券区 */
	.coupon-area {
		
		.coupon-item {
			margin-bottom: 20rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.content {
				&:after {
					position: absolute;
					left: 0;
					bottom: 0;
					content: '';
					width: 100%;
					height: 0;
					border-bottom: 1px dashed #f3f3f3;
					transform: scaleY(50%);
				}
			}

			.circle {
				position: absolute;
				bottom: -10rpx;
				z-index: 10;
				width: 20rpx;
				height: 20rpx;
				background: #f5f5f5;
				border-radius: 50%;

				&.r {
					right: -6rpx;
				}

				&.l {
					left: -6rpx;
				}
			}
		}
	}
	
	.use-count-down-item {
		min-width: 36rpx !important;
	}
</style>
