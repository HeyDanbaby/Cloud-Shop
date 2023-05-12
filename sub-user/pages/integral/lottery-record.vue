<template>
	<view class="padding">
		<use-navbar title="我的抽奖"></use-navbar>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" tip="无抽奖记录"></use-empty>
		
		<view v-else class="padding item border-radius dflex-b margin-bottom" v-for="(item, idx) in datas" :key="idx">
			<view class="fs fwb">{{$api.format(item.create_time)}}</view>
			<view class="tar">
				<view class="fwb"><text class="fs-lg">{{item.prize && item.prize.integral ? '+' : ''}}{{item.prize && item.prize.integral || '-'}}</text></view>
				<view class="fs-xs">{{item.prize && item.prize.name || '谢谢参与'}}</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				datas: [],
				empty: false
			}
		},
		onShow() {
			this.loadData();
		},	
		watch: {
			datas(e) {
				let empty = e.length === 0;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			}
		},
		methods: {
			loadData(){
				this.$db['usemall-lottery-record']
					.where('create_uid == $env.uid')
					.tolist({
						rows: 30,
						orderby: 'create_time desc'
					})
					.then(res => {
						if (res.code == 200) {
							this.datas = res.datas;
						}
					});
			},
		}
	}
</script>

<style lang="scss">
	.item {
		box-shadow: 0px 0px 17px 3px #f0f0f0;;
	}
</style>
