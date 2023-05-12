<template>
	<view class="sign-area">
		<use-navbar ref="navbar" title="积分签到" bgColor="#ff6a6c"></use-navbar>

		<view class="sign-top pos-r bg-base dflex dflex-flow-c">
			<view class="ft-white margin-top-sm fwb" style="font-size: 70rpx">{{ memberSign.member_integral || 0 }}
			</view>
			<view class="btn-line ft-black fs-xs border-radius-big" @click="toDetail">积分明细</view>
		</view>
		<view class="sign-content margin pos-a" :style="{ 'margin-top': navbarHeight + 'px' }">
			<view class="bg-main border-radius padding">
				<view class="title">
					<view class="fwb fs">
						<text class="d">已累计签到</text>
						<text class="ft-base margin-left-sm fwb">{{ memberSign.member_integral_sign_cnt || 0}}天</text>
					</view>
				</view>
				<view class="dflex-b margin-top">
					<view class="dflex-c dflex-flow-c" v-for="(item, index) in weeks" :key="index">
						<view :class="{ active: item.sign }" class="iconfont iconxuanzhong"></view>
						<view>{{item.name}}</view>
					</view>
				</view>
			</view>

			<view class="margin-top-xl">
				<view v-if="setting && setting._id" class="tac margin fs-xs">
					<text>连续签到{{ setting.continuous_sign_in_day }}天</text>
					<text class="margin-left-xs">可额外获得{{ setting.extra_gift_integral }}积分</text>
				</view>

				<view class="w-full margin-top">
					<view class="dflex-b border-radius-big">
						<view class="tac padding-tb-sm flex1 bg-disabled" v-if="loading">加载中 ...</view>
						<view class="tac padding-tb-sm flex1 bg-disabled" v-else-if="signed">今日已签到</view>
						<view class="tac padding-tb-sm flex1 dflex-c" :class="[ isubmit ? 'bg-disabled' : 'bg-base' ]" v-else @click="toSign">
							<view v-if="isubmit" class="use-loading"></view>
							<text v-else>立即签到</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<view v-if="setting && setting.yearly_integral_reset == '是' && memberSign.member_integral > 0"
			class="pos-f pos-bottom tac w-full bg-warn fs-xs safe-area-inset-bottom">
			<view class="padding">
				有{{memberSign.member_integral || 100}}积分将在{{new Date().getFullYear()}}-12-31过期
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	
	export default {
		computed: {
			...mapState(['islogin', 'member', 'h5Weixin'])
		},
		data() {
			return {
				weeks: [],
				setting: {},
				memberSign: {},
				data: {},
				signed: false,
				loading: true,
				isubmit: false,
				navbarHeight: 0
			}
		},
		onLoad() {
			uni.setStorage({
				key: this.$config.const.__sign_time,
				data: ''
			});
			
			this.loadData();
		},
		onShow() {
		},
		onHide() {
			
		},
		mounted() {
			this.navbarHeight = this.$refs.navbar.navbarHeight;
		},
		methods: {
			async loadData() {
				this.weeks = [
					{
						name: '周日',
						sign: false
					},
					{
						name: '周一',
						sign: false
					},
					{
						name: '周二',
						sign: false
					},
					{
						name: '周三',
						sign: false
					},
					{
						name: '周四',
						sign: false
					},
					{
						name: '周五',
						sign: false
					},
					{
						name: '周六',
						sign: false
					}
				];

				this.$func.usemall.call('integral/signData').then(res => {
					this.loading = false;
					// console.log('sign-data', res);
					if (res.code == 200) {
						this.setting = res.datas.parameter;
						this.memberSign = res.datas.memberSign;

						this.weeks.forEach((week, idx) => {
							if (res.datas.signRes.find(x => x.sign_week == week.name)) {
								week.sign = true;
								if (week.name == res.datas.signData.week) {
									this.signed = true;
									uni.setStorage({
										key: this.$config.const.__sign_time,
										data: this.$api.format(new Date(), 'yyyy-MM-dd')
									})
								}
							}

							if (week.name == res.datas.signData.week) {
								week.name = '今天';
							}
						});
					}
				});

			},
			toDetail() {
				uni.navigateTo({
					url: '/sub-user/pages/integral/detail'
				});
			},
			toSign() {
				if (this.isubmit) {
					return;
				}
				
				if (this.signed) {
					this.$api.msg('已签到，明天再来吧')
					return;
				}
				
				this.isubmit = 1;

				this.$func.usemall.call('integral/signIn', {
					addr: 'usemall-addr'
				}).then(res => {
					this.isubmit = 0;
					
					if (res.code == 200) {
						this.signed = true;
						this.$api.msg('恭喜签到成功');
						this.loadData();
						return;
					}
					
					this.$api.msg(res.msg);
				});
			}
		}
	}
</script>

<style lang="scss">
	page {
		overflow: hidden;
		background-color: #f5f5f5;
	}

	.sign-area {
		.sign-top {
			left: -10%;
			width: 120%;
			height: 360rpx;
			padding: 0rpx 10%;
			border-bottom-right-radius: 50%;
			border-bottom-left-radius: 50%;

			.btn-line {
				padding: 10rpx 30rpx;
				border: 1px solid #333;
			}
		}

		.bg-disabled {
			background-color: #c0c4cd !important;
			color: #fff !important;
		}

		.sign-content {
			top: 240rpx;
			left: 0;
			right: 0;
			margin: 0 50rpx;

			.iconfont {
				color: #c0c4cd;
				font-size: 50rpx;
			}
		}
	}
</style>
