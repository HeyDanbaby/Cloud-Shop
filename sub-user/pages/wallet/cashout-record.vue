<template>
	<view :class="[empty ? '' : 'padding-lr-sm']">
		<use-navbar title="提现记录"></use-navbar>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" e-type="cart" :btn-tip="false" tip="无提现记录"></use-empty>
		
		<view class="padding bg-main border-radius margin-top-sm" v-for="(item, idx) in datas" :key="idx">
			<view class="dflex-b">
				<view>
					<view class="fwb">{{ $api.format(item.create_time) }}</view>
					<view v-if="item.state == '已提现'" class="ft-dark fs-xxs">{{item.cashout_way}} - {{item.cashout_desc || ''}}</view>
					<view v-if="item.state == '提现失败'" class="ft-dark fs-xxs">{{item.cashout_way}} - {{item.cashout_fail || ''}}</view>
				</view>
				<view class="dflex-c dflex-flow-c">
					<view class="">
						￥<text class="fwb">{{item.cashout_amount / 100}}</text>
					</view>
					<view class="fs-xxs" :class="{ 'ft-base': item.state == '已提现' }">
						{{item.state}}
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
				
				this.$func.usemall.call('money/cashoutRecord', { state: this.state }).then(res => {
					if (res.code == 200) {
						this.datas = res.datas.data;
						
						this.empty = !(this.datas && this.datas.length > 0);
						console.log('datas', this.datas)
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
