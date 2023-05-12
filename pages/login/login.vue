<template>
	<view class="container bg-main pos-r">
		<use-navbar title="登录"></use-navbar>

		<view class="padding-xl dflex-c dflex-flow-c">
			<view class="headimg-box margin-top margin-bottom-xl">
				<image class="headimg border-radius-c" :src="(member && member.member_headimg) || '/static/images/user/default.png'"></image>
			</view>
			
			<swiper class="w-full" duration="200" disable-touch style="height: 190rpx !important;" :current="loginWay == 'code' ? 0 : 1">
				<!-- 验证码登录 -->
				<swiper-item>
					<view class="w-full dflex padding-bottom-sm">
						<view class="iconfont iconshouji margin-right"></view>
						<view class="flex1 dflex">
							<input class="border-line padding-sm flex1" type="number" data-key="mobile" maxlength="11"
								:value="mobile" @input="inputChange" placeholder="请输入手机号" />
							<view v-if="0 == 1" class="padding-tb-sm ft-dark" @click="send_code">获取</view>
						</view>
					</view>
					
					<use-smscode type="login" :mobile="mobile" :agreement="agreement" :agreementContent="agreementContent" @change="codeChange" @confirm="tologin"></use-smscode>
				</swiper-item>
				
				<!-- 账号密码登录 -->
				<swiper-item>
					<view class="w-full dflex padding-bottom-sm">
						<view class="iconfont iconshouji margin-right"></view>
						<view class="flex1 dflex">
							<input class="border-line padding-sm flex1" type="number" data-key="mobile" maxlength="11"
								:value="mobile" @input="inputChange" placeholder="请输入手机号" />
							<view v-if="0 == 1" class="padding-tb-sm ft-dark" @click="send_code">获取</view>
						</view>
					</view>
					
					<view class="w-full dflex">
						<view class="iconfont iconmima margin-right"></view>
						
						<view class="dflex flex1 border-line">
							<!-- #ifdef MP -->
							<input class="padding-sm flex1" type="text" password data-key="password" maxlength="20"
								:value="password" @input="inputChange" @confirm="tologin" placeholder="请输入密码" />
							<!-- #endif -->
						
							<!-- #ifndef MP -->
							<input class="padding-sm flex1" type="password" password data-key="password" maxlength="20"
								:value="password" @input="inputChange" @confirm="tologin" placeholder="请输入密码" />
							<!-- #endif -->
							
							<view class="pos-r">
								<view class="vertical-line" style="right: calc(100% + 20rpx);"></view>
								<view class="padding-tb-sm ft-dark" @click="toforget">忘记密码</view>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
			
			<view class="w-full margin-top-xxl">
				<view class="dflex-b border-radius-lg">
					<view class="tac padding-tb-sm flex1 bg-base fs" @click="tologin">登录</view>
				</view>
				<!-- 正式上线取消，测试账号仅做为测试使用 -->
				<view class="dflex-b border-radius-lg margin-top">
					<view class="tac padding-tb-sm flex1 bg-drak fs" @click="toTestLogin">测试账号登录</view>
				</view>
			</view>
			
			<view class="dflex-b w-full margin-bottom-sm ft-dark-4">
				<view v-if="loginWay == 'pwd'" class="padding-tb-sm" @click="loginWayChange('code')">验证码登录</view>
				<view v-if="loginWay == 'code'" class="padding-tb-sm" @click="loginWayChange('pwd')">账号密码登录</view>
				<view class="padding-tb-sm" @click="toregister">立即注册</view>
			</view>
			<view v-if="agreementDatas && agreementDatas.length > 0" class="dflex w-full margin-top" @click="toAgreement">
				<view v-if="agreement" class="iconfont iconxuanzhongzhuangtai margin-right-xs ft-base"></view>
				<view v-else class="iconfont iconweixuanzhongzhuangtai margin-right-xs"></view>
				<view class="ft-dark-3">
					登录即已同意<text v-for="(item, idx) in agreementDatas" :key="idx" class="ft-base" @click.stop="toContent(item)">《{{item.name}}》</text>
				</view>
			</view>
		</view>
		
		<view class="pos-f pos-bottom dflex-c w-full padding-bottom-lg">
			<!-- #ifdef MP -->
			<!-- #ifdef MP-WEIXIN -->
			<button class="dflex-c dflex-flow-c no-border btn" lang="zh_CN" @click="mpWeixinTologin">
				<view class="iconfont padding-lr-sm border-radius-c fs-xxxl iconweixin" style="color: #03cc6e;"></view>
				<view class="dflex-c fs-sm ft-dark">微信一键登录</view> 
			</button>
			<!-- #endif -->
			<!-- #ifdef MP-BAIDU || MP-QQ -->
			<button class="dflex-c dflex-flow-c no-border btn" open-type="getUserInfo" lang="zh_CN"
				withCredentials="true" @getuserinfo="mpGetUserInfo">
				<view class="iconfont padding-lr-sm border-radius-c fs-xxxl" :class="platform_icon"></view>
				<view class="dflex-c fs-sm ft-dark">{{ platform_name }} · 授权登录</view>
			</button>
			<!-- #endif -->
		
			<!-- #ifdef MP-ALIPAY -->
			<view class="dflex-c dflex-flow-c no-border btn" open-type="getAuthorize" scope="userInfo"
				@click="onGetAuthorize" @error="onAuthError">
				<view class="iconfont padding-lr-sm border-radius-c fs-xxxl" :class="platform_icon"></view>
				<view class="dflex-c fs-sm ft-dark">{{ platform_name }} · 授权</view>
			</view>
			<!-- #endif -->
		
			<!-- #ifdef MP-TOUTIAO -->
			<view class="dflex-c dflex-flow-c no-border btn" open-type="getUserInfo" lang="zh_CN" withCredentials="true"
				@click="getUserInfo">
				<view class="iconfont padding-lr-sm border-radius-c fs-xxxl" :class="platform_icon"></view>
				<view class="dflex-c ft-dark">{{ platform_name }} · 授权</view>
			</view>
			<!-- #endif -->
			<!-- #endif -->
			
			
			<!-- #ifdef APP -->
			<view class="dflex-c dflex-flow-c w-full padding-lr">
				<view class="ft-dark fs-xxs doblue-line margin-tb">
					<text class="padding-lr-xs">第三方登录方式</text>
				</view>
				<view class="dflex-c login-area">
					<view class="dflex-c dflex-flow-c" @click="mpWeixinTologin">
						<image class="dflex-c image-60" src="/static/images/login/wechat.png"></image>
						<text class="fs-xxs margin-top-xs">微信</text>
					</view>
					<view class="dflex-c dflex-flow-c" @click="univerifyTologin">
						<image class="dflex-c image-60" src="/static/images/login/univerify.png"></image>
						<text class="fs-xxs margin-top-xs">手机</text>
					</view>
					<view v-if="hasApple" class="dflex-c dflex-flow-c" @click="appleTologin">
						<image class="dflex-c image-60" src="/static/images/login/apple.png"></image>
						<text class="fs-xxs margin-top-xs">Apple</text>
					</view>
				</view>
			</view>
			<!-- #endif -->
		</view>
		
		<!-- 绑定手机号 -->
		<use-popup v-model="bindMobileShow" bgclass=" " mode="top" @open="loginWay = 'code'" @close="bindMobileShow = false;">
			<view class="bind-area bg-main pos-r border-radius-bottom">
				<!-- #ifndef MP-WEIXIN -->
				<view class="dflex ft-dark fs-xs margin-bottom-sm margin-lr-xs">
					<view>绑定手机号</view>
				</view>
				
				<view class="w-full dflex padding-bottom-sm">
					<view class="iconfont iconshouji margin-right"></view>
					<view class="flex1 dflex">
						<input v-if="bindMobileShow" class="border-line padding-sm flex1" type="number" data-key="mobile" maxlength="11"
							focus="mobileFocus" :value="mobile" @input="inputChange" placeholder="请输入手机号" />
					</view>
				</view>
				
				<use-smscode class="w-full" type="login" :code-valid="codeValid" :mobile="mobile" @change="codeChange"
					@confirm="tologin" @sent="codeSent" @sendCode="verify"></use-smscode>
				
				<view class="w-full margin-top-xxl">
					<view class="dflex-b border-radius-lg">
						<view class="tac padding-tb-sm flex1 bg-base fs" @click="tologin">绑定并登录</view>
					</view>
				</view>
				<!-- #endif -->
				
				<!-- #ifdef MP-WEIXIN -->
				<view class="dflex margin-lr">
					<view class="dflex-c">
						<image class="headimg border-radius" style="width: 100rpx;height: 100rpx;" src="/static/images/logo.png"></image>
					</view>
					<view class="margin-left-sm">
						<view class="fwbd fs">{{ config.appname }}</view>
						<view class="dflex fs-xs">
							<view>申请授权获取你的手机号</view>
						</view>
					</view>
				</view>
				
				<view class="dflex-c dflex-flow-c" style="padding: 120rpx 0;">
					<image class="headimg border-radius-c" style="width: 80rpx;height: 80rpx;" :src="(member && member.member_headimg) || '/static/images/user/default.png'"></image>
					<view class="fwb">{{ member && member.member_nickname || 'Usecloud' }}</view>
				</view>
				
				<!-- 微信手机号一键绑定并登录 -->
				<button class="btn no-border padding-0" open-type="getPhoneNumber" @getphonenumber="mpPhoneNumber" @click="islogin = true">
					<view class="w-full margin-top-xxl padding-bottom-xl">
						<view class="dflex-b border-radius-lg">
							<view class="dflex-c padding-tb-sm flex1 bg-base fs">
								<view v-if="islogin" class="use-loading margin-right-sm"></view>
								绑定并登录
							</view>
						</view>
					</view>
				</button>
				<!-- #endif -->
			</view>
		</use-popup>
		
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	
	// #ifdef APP
	let weixinAuthService;
	// #endif

	export default {
		data() {
			return {
				loginWay: 'code',
				agreement: true,
				agreementContent: '已阅读并同意',
				agreementDatas: [],
				ismp: false,
				platform: '',
				platform_name: '',
				platform_icon: '',

				env: {},

				mobile: '',
				password: '',
				code: '',
				codeValid: false,

				authorize: 0,
				hasApple: false,
				bindMobileShow: false,
				hasWeixinAuth: false
			};
		},
		computed: {
			...mapState(['member']),
			config() {
				return this.$config;
			}
		},

		onShow() {
			console.log('login Show');
			
			// #ifdef MP-WEIXIN
			let lopts = uni.getLaunchOptionsSync();
			console.log(lopts);
			// #endif
			
			uni.getStorage({
				key: '__mobile',
				success: (res) => {
					this.mobile = res.data || '';
				}
			});
			
			uni.getStorage({
				key: '__loginWay',
				success: (res) => {
					this.loginWay = res.data || 'code';
				}
			})
			
			// #ifndef APP || H5
			// 查看用户是否已授权获取用户数据
			if (uni.canIUse('getSetting')) {
				uni.getSetting({
					success: (res) => {
						console.log('getSetting ', res);
						this.authorize = res.authSetting['scope.userInfo'];
						console.log('getSetting scope.userInfo authorize ', this.authorize);
					}
				});
			}
			// #endif
		},
		onLoad() {
			
			this.$api.get_env(res => {
				this.env = res;
				console.log('this.env', this.env);
				this.ismp = this.env.is_mp;
				this.platform = this.env.platform;
				this.platform_icon = this.env.platform_icon;
				this.platform_name = this.env.platform_name;
				// #ifdef APP
				this.hasApple = this.env.os.name == 'ios';
				// #endif
			});

			this.$db['usemall-sys-agreement'].where({
				type: '登录'
			}).tolist().then(res => {
				if (res.code == 200) {
					this.agreementDatas = res.datas;

					this.agreementContent += this.agreementDatas.map(x => x.name).join('、');
				}
			})
			
			
			// #ifdef APP
			uni.checkSession = (res) => {
				if (typeof res.success === 'function') {
					res.success();
				}
			}
			
			plus.oauth.getServices((services) => {
				weixinAuthService = services.find((service) => {
					return service.id === 'weixin'
				})
				if (weixinAuthService) {
					this.hasWeixinAuth = true
				}
			});
			// #endif
		},
		methods: {
			...mapMutations(['login', 'logout', 'token']),
			openAuthSetting() {

				uni.authorize({
					scope: 'scope.userInfo',
					success: () => {
						console.log('scope.userInfo success');
					},
					fail: () => {
						uni.getSetting({
							success: (res) => {
								console.log('getSetting ', res);
								this.authorize = res.authSetting['scope.userInfo'];
								console.log('getSetting scope.userInfo authorize ', this.authorize);

								if (!this.authorize) {
									uni.showModal({
										title: '提示',
										content: '打开授权后才能使用授权登录',
										success: (res) => {
											if (res.confirm) {
												uni.openSetting({
													success: (res) => {
														console.log('openSetting', res.authSetting);
														this.authorize = res.authSetting['scope.userInfo'];
													},
													fail: () => {
														this.$api.msg('打开当前设置失败', 5000);
													}
												});
											} else if (res.cancel) {
												console.log('用户点击取消');
											}
										}
									});
								}
							},
							fail: () => {
								this.$api.msg('获取当前设置失败', 5000);
							}
						});
					}
				});
			},
			loginWayChange(res) {
				this.loginWay = res;
			},
			codeChange(code) {
				this.code = code;
			},
			toContent(item) {
				const content =
					`<div class="__rich_text">${item.content.replace(/<h1/gi, '<h1 class="use-p"').replace(/<h3/gi, '<h3 class="use-p"').replace(/<p/gi, '<p class="use-p"')}</div>`;

				uni.setStorage({
					key: '__rich_text',
					data: content,
					success() {
						uni.navigateTo({
							url: '/pages/content/rich-text'
						})
					}
				})
			},
			toAgreement() {
				this.agreement = !this.agreement;
			},
			inputChange(e) {
				const key = e.currentTarget.dataset.key;
				this[key] = e.detail.value;
			},
			toforget() {
				// 忘记密码
				uni.navigateTo({
					url: '/pages/login/forgot-password'
				});
			},
			toregister() {
				// 注册页
				uni.navigateTo({
					url: '/pages/login/register'
				});
			},
			// 测试账号登录
			toTestLogin() {
				this.loginWay = 'pwd';
				
				this.mobile = '18825282536';
				this.password = '123456';
				
				this.tologin();
			},
			async tologin(type) {
				if (this.is_login) return;

				if (!this.mobile) {
					this.$api.msg('请输入手机号');
					return;
				}
				
				let url = 'member/login';
				let data = {
					sharemid: uni.getStorageSync('__use_share_mid') || ''
				};
				if (this.loginWay == 'pwd') {
					if (!this.password) {
						this.$api.msg('请输入密码');
						return;
					}
					if (this.$api.trim(this.password).length < 4) {
						this.$api.msg('密码长度不能小于4位');
						return;
					}
					
					data.username = this.mobile;
					data.password = this.password;
				} else if (this.loginWay == 'code') {
					if (!this.code) {
						this.$api.msg('请输入验证码');
						return;
					}
					if (this.code.length != 6) {
						this.$api.msg('验证码错误');
						return;
					}
					
					url = 'member/loginBySms';
					data.mobile = this.mobile;
					data.code = this.code;
					// #ifdef APP || MP-WEIXIN
					if (this.bindMobileShow) {
						// #ifdef APP
						if (!this.hasWeixinAuth) {
							this.$api.msg('应用未启用微信授权登录');
							return;
						}
						// #endif
						data.wxcode = await this.getWeixinCode();
						
						// #ifdef MP-WEIXIN
						data.user = uni.getStorageSync('__wxuser') || {};
						data.from = 'mp';
						// #endif
						
						// #ifdef APP
						data.from = 'app';
						// #endif
						
						// 解绑并绑定
						if (type == 'unbind-bind') data.type = type;
					}
					// #endif
				}
				
				if (!this.agreement) {
					this.$api.msg(this.agreementContent);
					return;
				}
				
				uni.showLoading({
					title: '登录中'
				})

				this.$func.usemall
					.call(url, data)
					.then(res => {
						uni.hideLoading();
						
						if (res.code == 100) {
							// 当前手机号已绑定其他微信号，弹窗询问是否解绑
							uni.showModal({
								content: '已绑定其他微信号，是否解绑并绑定当前微信号',
								cancelText: '取消',
								confirmText: '解绑并绑定',
								success: (res) => {
									if (res.confirm) {
										// 登录类型解绑并绑定
										this.tologin('unbind-bind');
									}
								}
							})
							return;
						}
						
						if (res.code == 200) {
							// 调用 store login
							if (res.datas.member && res.datas.member.is_plus === '付费会员' && res.datas.member.plus_time >= new Date().getTime()) {
								res.datas.member.vip = true;
							}
							uni.setStorage({
								key: '__mobile',
								data: this.mobile
							})
							uni.setStorage({
								key: '__loginWay',
								data: this.loginWay
							})
							this.login(res.datas);

							this.$api.msg('登录成功');
							this.$api.back();
							return;
						}

						this.$api.msg(res.msg);
					});
			},
			
			// 微信授权登录，获取用户信息
			mpGetUserInfo(userinfo) {
				if (!this.agreement) {
					this.$api.msg(this.agreementContent);
					return;
				}
				this.$api.msg('处理中');
				this.logout();

				this.$api.msg('请使用手机号+密码的方式登录');
				if (this.platform !== 'weixin' && this.platform !== 'baidu' && this.platform !== 'qq' && this.platform !==
					'toutiao') {
					this.$api.msg('请使用手机号+密码的方式登录');
					return;
				}
			},
			// #ifdef MP-ALIPAY
			onGetAuthorize() {
				if (!this.agreement) {
					this.$api.msg(this.agreementContent);
					return;
				}
				this.$api.msg('处理中');

				console.log('------- onGetAuthorize 用户授权，并获取用户基本信息 ------');

				uni.login({
					scopes: ['auth_base'],
					success: (mpres) => {
						console.log('uni.login', mpres);
						if (mpres.errMsg == 'login:ok') {
							this.$func.usemall
								.call('member/loginByAlipay', {
									sharemid: uni.getStorageSync('__use_share_mid') || '',
									code: mpres.code
								})
								.then(res => {
									if (res.code == 200) {
										console.log('member/loginByAlipay', res);
										// 调用 store login
										this.login(res.datas);
										
										this.$api.back();
										return;
									}

									this.$api.msg(res.msg);
								});
						}
					},
					fail: (err) => {
						console.log('uni.login', err);
					}
				});

				// 调用 store mp_login
				// this.mp_login({
				// 	logintype: 'relogin',
				// 	type: this.platform + '-mini',
				// 	callback: (loginres) => {
				// 		console.log('mp_login callback', loginres);
				// 		if (loginres.code !== 200) {
				// 			this.$api.msg(loginres.msg, 5000);
				// 			return;
				// 		}

				// 		// 调用 store login
				// 		this.login(loginres.datas);

				// 		this.$api.alert('登录成功', () => {
				// 			uni.navigateBack();
				// 		});
				// 	}
				// });
			},
			onAuthError(res) {
				console.log('onAuthError', arguments);
				this.$api.msg(res.detail.errorMessage)
			},
			// #endif
			getUserInfo() {
				this.$api.msg('处理中');
				console.log('------- getUserInfo 用户授权，并获取用户基本信息和加密数据------');
			},
			getUserProfile() {
				uni.getUserProfile();
			},
			// #ifdef MP-WEIXIN || APP
			mpWeixinTologin() {
				if (!this.agreement) {
					this.$api.msg(this.agreementContent);
					return;
				}
				uni.showLoading({
					title: '处理中'
				});

				// 获取用户数据
				this.mpWeixinGetUserProfile((success, userRes) => {
					if (!success) {
						uni.hideLoading();
						return;
					}
					
					uni.login({
						provider: 'weixin',
						onlyAuthorize: true,
						success: (mpres) => {
							console.log('uni.login', mpres);
							if (mpres.errMsg == 'login:ok') {
								this.$func.usemall
									.call('member/loginByWeixin', {
										sharemid: uni.getStorageSync('__use_share_mid') || '',
										code: mpres.code,
										user: userRes
									})
									.then(res => {
										uni.hideLoading();
										
										if (res.code == 100) {
											// 已登录用户ID
											userRes = userRes || {};
											userRes.uid = res.result.datas;
											uni.setStorage({
												key: '__wxuser',
												data: userRes
											})
											// 未绑定手机号
											this.loginWay = 'code';
											this.bindMobileShow = true;
											this.$api.msg(res.msg);
											return;
										}
										
										if (res.code == 200) {
											console.log('member/loginByWeixin', res);
											// 调用 store login
											this.login(res.datas);
					
											// 存储已授权登录
											uni.setStorageSync('__usemall_login', this.$api.format(new Date(), 'yyyyqq'));
											
											this.$api.msg('登录成功');
											this.$api.back();
											return;
										}
					
										this.$api.msg(res.msg);
									});
							}
						},
						fail: (err) => {
							console.log('uni.login', err);
							uni.hideLoading();
						}
					});
				});

			},
			mpWeixinGetUserProfile(callback) {
				// 适配最新版微信小程序 头像、昵称 问题
				// #ifdef APP || MP-WEIXIN
				callback(true, null);
				return;
				// #endif
				
				// 判断是否为首次登录
				if (uni.getStorageSync('__usemall_login') === this.$api.format(new Date(), 'yyyyqq')) {
					// 已登录
					callback(true, null);
					return;
				}

				uni.getUserProfile({
					desc: '更新会员信息',
					lang: 'zh_CN',
					success(res) {
						if (typeof callback === 'function') {
							callback(true, {
								nickname: res.userInfo.nickName,
								gender: res.userInfo.gender,
								avatar: res.userInfo.avatarUrl,
								comment: [res.userInfo.country, res.userInfo.province, res.userInfo.city].filter(x => x).join('-')
							});
						}
					},
					fail(err) {
						console.log(err);
						callback(false, null);
					}
				});
			},
			async getWeixinCode() {
				return new Promise((resolve, reject) => {
					// #ifdef MP-WEIXIN
					uni.login({
						success: (res) => {
							resolve(res.code);
						},
						fail: (err) => {
							reject(err)
						}
					});
					// #endif
					// #ifdef APP
					weixinAuthService.authorize((res) => {
						resolve(res.code)
					}, (err) => {
						console.log(err)
						reject(new Error('微信登录失败'))
					});
					// #endif
				})
			},
			// #endif
			// #ifdef MP-WEIXIN
			// 微信小程序手机号
			async mpPhoneNumber(res) {
			
				if (!(res.detail && res.detail.encryptedData)) {
					this.islogin = false;
					if (res.detail.errMsg === 'getPhoneNumber:fail no permission' && this.platform === 'qq') {
						uni.showToast({
							title: 'QQ暂无法获取手机号',
							icon: 'none'
						});
					} else {
						// uni.showToast({
						// 	title: '您取消了授权',
						// 	icon: 'none'
						// });
					}
			
					// uni.navigateBack();
					return false;
				}
				console.log('用户授权', res.detail);
				
				uni.showLoading({
					title: '处理中'
				});
				
				const wxcode = await this.getWeixinCode();
				
				this.$func.usemall
					.call('member/loginByPhoneNumber', {
						sharemid: uni.getStorageSync('__use_share_mid') || '',
						user: uni.getStorageSync('__wxuser') || {},
						wxcode: wxcode,
						...res.detail
					})
					.then(res => {
						this.islogin = false;
						uni.hideLoading();
						
						if (res.code == 60101 || [103, 104].includes(res.code)) {
							this.$api.alert(res.msg);
							this.bindMobileShow = false;
							return;
						}
						
						if (res.code == 200) {
							console.log('member/loginByPhoneNumber', res);
							// 调用 store login
							this.login(res.datas);
							
							// 存储已授权登录
							uni.setStorageSync('__usemall_login', this.$api.format(new Date(), 'yyyyqq'));
							
							this.$api.msg('登录成功');
							this.$api.back();
							return;
						}
									
						this.$api.msg(res.msg);
					});
			},
			// #endif
			// #ifdef APP
			univerifyTologin() {
				
			},
			appleToLogin() {
				
			},
			// #endif
			codeChange(code) {
				this.code = code;
			},
			codeSent(res) {
				if (!res.bound) {
					// #ifdef MP-WEIXIN
					const ltype = '__usemall_login_sms_' + this.mobile;
					uni.removeStorage({
						key: ltype
					});
					// #endif
				}
			},
			
			inputChange(e) {
				const key = e.currentTarget.dataset.key;
				this[key] = e.detail.value;
			},
			verify() {
				this.codeValid = false;
				if (!this.mobile) {
					this.$api.msg('请输入手机号');
					return false;
				}
				if (!/(^1[0-9][0-9]{9}$)/.test(this.mobile)) {
					this.$api.msg('请输入正确的手机号码');
					return false;
				}
				
				this.codeValid = true;
				return true;
			}
		}
	};
</script>

<style lang="scss">
	.headimg-box {
		image {
			width: 130rpx;
			height: 130rpx;
		}
	}

	.login-area {
		view { width: 25vw; }
	}
	
	.bind-area {
		width: 100vw;
		padding: 80rpx;
		padding-top: 100rpx;
	
		.field {
			background-color: #f5f5f5;
			textarea {
				height: 100rpx !important;
			}
		}
	}
	
</style>
