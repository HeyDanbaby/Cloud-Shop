<template>
	<view class="container margin-lr">
		<use-navbar title="个人资料"></use-navbar>

		<view class="border-radius dflex-b bg-main padding-lr padding-tb-sm margin-top" @click="toHeadimg">
			<text>头像</text>

			<view class="dflex-c">
				<image class="border-radius-c headimg image-60 margin-right-xs"
					:src="member.member_headimg || '/static/images/user/default.png'"></image>
				<view class="iconfont iconjiantou-01 fs-sm" style="color: #c0c0c0;"></view>
			</view>
		</view>

		<view class="border-radius margin-top-sm">
			<use-list-title title="昵称" iconfont=" " @goto="toEdit('nickname', '昵称', 26)"
				:tip="member.member_nickname"></use-list-title>
			<use-list-title title="性别" iconfont=" " @goto="toSex"
				:tip="(member.member_gender == 0 ? '未知' : member.member_gender == 1 ? '男' : '女') || '未知'">
			</use-list-title>
			<use-list-title title="地区" iconfont=" " @goto="toCity" :tip="member.member_city"></use-list-title>
		</view>

		<view class="border-radius margin-top-sm">
			<use-list-title title="姓名" iconfont=" " @goto="toEdit('truename', '姓名', 10)"
				:tip="member.member_truename || '未实名'"></use-list-title>
		</view>

		<view class="border-radius margin-top-sm">
			<use-list-title title="个人签名" iconfont=" " @goto="toEdit('slogan', '个人签名', 30)"
				:tip="member.slogan || '未填写'"></use-list-title>
		</view>

		<view class="padding"></view>

		<l-clipper v-if="clipperShow" :image-url="member.member_headimg" :quality="0.6" @success="clipperSuccess"
			@cancel="clipperShow = false"></l-clipper>

		<use-popup v-model="editShow" bgclass=" " mode="top" borderRadius="20">
			<view class="oper-area border-radius bg-main pos-r">
				<view class="pos-a pos-top pos-right padding-sm" @click="editShow = false">
					<view class="iconfont iconguanbi"></view>
				</view>
				
				<view class="dflex-b ft-dark fs-xs margin-bottom-sm margin-lr-xs">
					<view>修改{{editTxt}}</view>
					<view>{{editVal.length}}/{{editMaxLength}}</view>
				</view>
				<view class="dflex border-radius-sm field" style="padding: 18rpx 16rpx">
					<textarea class="fwb fs-sm" type="text"
						v-model="editVal" auto-height disable-default-padding
						style="max-height: 160rpx; min-height: 40rpx; height: 40rpx; font: initial;"
						:focus="editShow" confirm-type="done"
						:show-confirm-bar="false" cursor-spacing="20" placeholder="请输入" placeholder-class="fs-sm" 
						:maxlength="editMaxLength" @confirm="editConfirm" />
				</view>

				<view class="bg-base margin-top-xl tac w-full border-radius-lg padding-tb-sm" @click.stop="editConfirm">
					提交
				</view>
			</view>
		</use-popup>

		<!-- 性别 -->
		<use-action-sheet v-model="actionSheetShow" :list="actionSheetList" :tips="actionSheetTips"
			@click="actionSheetClick"></use-action-sheet>

		<!-- 地区 -->
		<use-address ref="useAddress" @onConfirm="changeAddr" cancelColor="#bbb" themeColor="#ff6a6c"></use-address>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	
	import lClipper from '@/sub-user/components/lime-clipper/components/l-clipper/l-clipper';
	
	export default {
		components: {
			lClipper
		},
		computed: {
			...mapState(['islogin', 'member'])
		},
		data() {
			return {
				clipperShow: false,
				editShow: false,
				editKey: '',
				editVal: '',
				editTxt: '',
				editMaxLength: 30,

				actionSheetShow: false,
				actionSheetList: [{
					text: "男",
					color: "#333"
				}, {
					text: "女",
					color: "#333"
				}],
				actionSheetTips: {
					text: "",
					color: "#9a9a9a",
					size: 24
				},
			};
		},
		onShow() {
			uni.hideLoading();
			
			if (!this.islogin) {
				this.$api.msg('账号未登录');
				return;
			}
		},
		methods: {
			...mapMutations(['putMember']),
			toHeadimg(res) {
				this.clipperShow = true;
			},
			async clipperSuccess(e) {
				console.log('clipper', e);
				let url = e.url;
				uni.showLoading({
					title: '上传中'
				})
				// #ifdef H5
				url = URL.createObjectURL(await this.base64ToBlob({
					b64data: url
				}));
				// #endif
				
				const uRes = await this.$api.uploadFile(url, `${Date.now()}.png`)
					.catch(err => {
						this.$api.msg(err.message);
						uni.hideLoading();
					});
				
				this.updateUser({
					avatar: uRes.url
				}, () => {
					this.member.member_headimg = uRes.url;
					this.clipperShow = false;
					
					uni.hideLoading();
				});
				
				try {
					URL.revokeObjectURL(url)
				} catch {}
			},
			// #ifdef H5
			base64ToBlob({
				b64data = '',
				contentType = 'image/png'
			} = {}) {
				return new Promise((resolve, reject) => {

					try {
						const arr = b64data.split(',');
						const bytes = window.atob(arr[1]);
						const ua = new Uint8Array(new ArrayBuffer(bytes.length));
						for (let i = 0; i < bytes.length; i++) {
							ua[i] = bytes.charCodeAt(i);
						}

						resolve(new Blob([ua], {
							type: contentType
						}));
					} catch (e) {
						reject(e);
					}
				});
			},
			// #endif
			toEdit(key, txt, len) {
				this.editShow = true;
				this.editKey = key;
				this.editTxt = txt;
				this.editMaxLength = len;
			},
			editConfirm() {
				let data = {};
				data[this.editKey] = this.editVal.replace(/\n/g, '').replace(/\r\n/g, '').trim();
				if (!data[this.editKey]) {
					this.$api.msg('请填写' + this.editTxt);
					return;
				}
				this.updateUser(data, () => {
					if (this.editKey == 'nickname') {
						this.member['member_nickname'] = data[this.editKey];
					} else if (this.editKey == 'truename') {
						this.member['member_truename'] = data[this.editKey];
					} else {
						this.member[this.editKey] = data[this.editKey];
					}
					this.editShow = false;
					this.editVal = '';
				})
			},

			toSex() {
				this.actionSheetShow = true;
			},
			// 点击操作菜单
			actionSheetClick(index) {
				// switch (index) {
				// 	case 0:
				// 		this.$api.msg('男');
				// 		break;
				// 	case 1:
				// 		this.$api.msg('女');
				// 		break;
				// }
				if (this.member.member_gender == index + 1) return;
				
				this.updateUser({
					gender: index + 1
				}, () => {
					this.member.member_gender = index + 1;
				})
			},

			toCity() {
				this.$refs.useAddress.open();
			},
			changeAddr(res) {
				if (this.member.member_city == res.label) return;
				console.log('addr', res);
				this.updateUser({
					comment: res.label
				}, () => {
					this.member.member_city = res.label;
				})
			},
			updateUser(data, callback) {
				this.$func.usemall.call('member/updateUser', data).then(res => {
					if (res.code == 200) {
						if (typeof callback === 'function') {
							callback(res);
							
							this.putMember(this.member);
						}
						return;
					}

					this.$api.msg(res.msg);
				});
			}
		}
	}
</script>

<style lang='scss'>
	page {
		background: $page-color-base;
	}

	.oper-area {
		width: 80vw;
		padding: 80rpx;
		padding-top: 100rpx;
		margin-top: 20vh;
		margin-left: 10vw;

		.field {
			background-color: #f5f5f5;
		}
	}
</style>
