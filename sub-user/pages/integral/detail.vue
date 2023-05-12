<template>
	<view class="padding">
		<use-navbar title="积分明细"></use-navbar>
		
		<!-- 空白页 -->
		<use-empty v-if="empty" e-style="round" tip="无积分明细"></use-empty>
		
		<view v-else class="padding item border-radius dflex-b margin-bottom" v-for="(item, idx) in datas" :key="idx">
			<view class="fs fwb">{{item.time}}</view>
			<view class="tar">
				<view class="fwb"><text class="fs-lg">{{item.type == '收入' ? '+' : '-'}}{{item.integral}}</text></view>
				<view class="fs-xs">{{item.source}}</view>
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
				
				this.$db['usemall-integral-record']
					.where('create_uid == $env.uid')
					.tolist({
						rows: 100,
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
