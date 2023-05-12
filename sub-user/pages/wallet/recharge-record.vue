<template>
	<view :class="[empty ? '' : 'padding-lr-sm']">
		<use-navbar title="充值记录"></use-navbar>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" e-type="cart" :btn-tip="false" tip="无充值记录"></use-empty>
		
		<view v-else class="padding bg-main border-radius margin-top-sm" v-for="(item, idx) in datas" :key="idx">
			<view class="dflex-b">
				<view class="dflex">
					<view class="margin-right-sm">
						<view>
							<image :src="item.member_headimg || '/static/images/user/default.png'" class="border-radius-lg headimg" mode="" style="width: 66rpx; height: 66rpx;"></image>
						</view>
					</view>
					<view>
						<view class="fwb">
							{{ item.source }}
						</view>
						<view class="fs-xxs">
							{{ $api.format(item.create_time, 'yyyy/MM/dd hh:mm') }}<text class="padding-lr-xs"></text>{{ item.state }}
						</view>
					</view>
				</view>
				<view class="dflex-c dflex-flow-c">
					<view class="bg-base border-radius-lg fs-xxs" style="padding: 2rpx 20rpx;">
						{{ item.type }}
					</view>
					<view>
						<text class="fwb">{{ item.money_fmt }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState, mapMutations } from 'vuex';
	export default {
		computed: {
			...mapState(['islogin', 'member'])
		},
		data() {
			return {
				empty: false,
				datas: []
			};
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			loadData() {
				
				this.$db['usemall-member-money-log']
					.where({ create_uid: this.member._id, type: this.$dbcmd.in(['充值', '退款']) })
					.tolist({ orderby: 'create_time desc', rows: 100 })
					.then(res => {
						console.log('res', res);
						if (res.code == 200) {
							this.datas = res.datas;
							
							this.empty = !(this.datas && this.datas.length > 0);
						}
					});
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f5f5f5;
	}
</style>
