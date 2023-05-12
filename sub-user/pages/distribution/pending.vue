<template>
	<view :class="[empty ? '' : 'padding-lr-sm']">
		<use-navbar title="待结算佣金"></use-navbar>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" e-type="cart" :btn-tip="false" tip="无成员数据"></use-empty>
		
		<view class="padding bg-main border-radius margin-top-sm" v-for="(item,idx) in datas" :key="idx">
			<view class="dflex-b">
				<view class="">
					<view class="fwb">
						{{ $api.format(item.create_time, 'yyyy/MM/dd hh:mm') }}
					</view>
				</view>
				<view class="dflex-c dflex-flow-c">
					<view class=" border-radius-lg">
						￥<text class="fwb">{{ $api.format_float(item.profit_amount / 100) }}</text>
					</view>
					<view class="ft-base fs-xxs">
						{{item.state}}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
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
				
				this.$func.usemall.call('fxs/record', { state: '未结算' }).then(res => {
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
