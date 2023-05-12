<template>
	<view class="bg-drak" :class="[empty ? '' : 'padding-tb']">
		<use-navbar title="订单物流"></use-navbar>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" tip="无物流数据"></use-empty>
	
		<view v-if="expressData && expressData.data" class="padding-lr">
			<view class="border-radius padding margin-bottom-sm bg-main">
				<view class="fs-lg fwb">{{expressData.company}}</view>
				<view>运单号：{{expressData.nu}}<text class="copy" @click="copy">复制</text></view>
			</view>
		</view>
		<view v-if="expressData && expressData.data" class="padding-lr">
			<view class="product border-radius padding margin-bottom-sm bg-main" style="padding-bottom: 15rpx;">
				<view :class="{ 'active': index == 0, 'fwb': index == 0 }" class="dflex item pos-r" v-for="(item, index) in expressData.data" :key="index">
					<view :class="{ 'active': index == 0 }" class="circle"></view>
					<view :class="{ 'ft-dark': index > 0 }" class="margin-left-lg pos-r w-full margin-bottom">
						<view>{{item.context}}</view>
						<view class="margin-top-xs fs-xs">{{item.time}}</view>
					</view>
				</view>
			</view>
		</view>
	
		<!-- 置顶 -->
		<use-totop ref="usetop"></use-totop>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 类型 1订单发货寄出 2售后退换货寄回 3售后换货寄出
				type: 1,
				empty: false,
				order_id: '',
				aftersale_id: '',
				expressData: null
			}
		},
		watch: {
			expressData(e) {
				let empty = !(e && e.data);
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		onPageScroll(e) {
			//this.scrollTop = e.scrollTop;
			this.$refs.usetop.change(e.scrollTop);
		},
		onLoad(options) {
			this.order_id = options.order_id;
			this.aftersale_id = options.aftersale_id;
			this.type = parseInt(options.type || 1);
			
			switch (this.type) {
				case 1:
					if(!this.order_id) {
						this.$api.msg('订单号不存在');
						return;
					}
					break;
				case 2:
				case 3:
					if(!this.aftersale_id) {
						this.$api.msg('售后ID不存在');
						return;
					}
					break;
			}
			
			this.loadData();
		},
		onShow() {
			
		},
		methods: {
			loadData() {
				let url = '';
				const data = {};
				switch (this.type){
					case 1:
						url = 'order/express';
						data.order_id = this.order_id;
						break;
					case 2:
					case 3:
						url = 'orderaftersale/express';
						data.aftersale_id = this.aftersale_id;
						data.type = this.type;
						break;
				}
				this.$func.usemall.call(url, data)
					.then(res => {
						if (res.code == 200) {
							this.expressData = res.datas;
							return;
						}
						
						this.expressData = [];
						this.$api.msg(res.msg);
					});
			},
			// 点击复制
			copy() {
			
				uni.setClipboardData({
					data: this.expressData.nu,
					success: function(res) {
						uni.getClipboardData({
							success: function(res) {
								uni.showToast({
									title: '复制成功'
								});
							}
						});
					}
				});
			},
		}
	}
</script>

<style>
	
.copy {
	margin-left: 30rpx;
	padding: 10rpx 40rpx;
	background-color: #f1f1f1;
	border-radius: 40rpx;
	font-size: 24rpx;
}
	
.item {
    align-items: baseline;
}

.item:not(:last-child)::before {
	content: ' ';
	border-left: 1px solid #d3d3d3;
	position: absolute;
	bottom: -14rpx;
	top: 14rpx;
	left: 10rpx;
	border-left-width: 1px;
	border-left-style: solid;
	border-left-color: rgb(211, 211, 211);
}
.item.active::before{
    border-left: 1px solid #ff6a6c;
}

.circle {
	width: 20rpx;
	height: 20rpx;
	position: absolute;
	background: #d3d3d3;
	border-radius: 50%;
	top: 14rpx;
}

.circle.active {
	background: #ff6a6c !important;
	transform: scale(1.1);
}

.circle.active::after {
	content: ' ';
	background: rgba(255, 106, 108, 0.5) !important;
	-webkit-transform: scale(1.6);
	transform: scale(1.6);
	width: 20rpx;
	height: 20rpx;
	position: absolute;
	border-radius: 50%;
}
</style>
