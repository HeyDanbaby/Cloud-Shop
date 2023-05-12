<script>
	/**
	 * vuex 管理登陆状态，具体可以参考官方登陆模板示例 
	 */
	import {
		mapState,
		mapMutations
	} from 'vuex';

	import uapi from 'common/common.js';
	import config from 'common/config.js';

	const db = uniCloud.database();

	export default {
		computed: {
			...mapState(['member', 'h5Weixin'])
		},
		methods: {
			...mapMutations(['token', 'loadToken', 'logout', 'login', 'h5WeixinToken', 'h5WeixinOAuth']),
			// 处理 query q 数据
			resolveQueryq(query) {
				let obj = {};
				const arr = query
					.split('/')
					.slice(-1)[0]
					.split('_');
				if (arr.length == 2) obj.mid = arr[1];
				obj.id = arr[0];

				return obj;
			}
		},
		onLaunch: function(options) {
			console.log('App Launch', options, config);

			// #ifdef H5-WEIXIN
			// 微信公众号
			console.log('App Launch h5Weixin', options, config, location);
			// uapi.alert(navigator.userAgent.toLowerCase(), 5000)
			const uparams = uapi.request(location.href);
			console.log('uparams', uparams);
			// 跳转微信公众号授权登录
			if (!uapi.isInternalWeixin()) {
				let redirect_url = encodeURIComponent(location.href);
				let aEle = document.createElement('a');
				// 微信公众号 appid（替换为自己公众号的）
				let appid = 'wx72c7404c67cd1fb7';
				aEle.href =
					`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_url}&response_type=code&scope=snsapi_userinfo&state=usemall#wechat_redirect`;

				aEle.click();
				aEle.remove();
				return;
			}

			// 加载微信公众号 Token
			this.h5WeixinToken(uparams.code);
			//if (!(this.h5Weixin && this.h5Weixin.openid)) {
			// 根据code获取当前用户 openid
			uniCloud.callFunction({
				name: 'usemall',
				data: {
					action: 'member/h5WeixinAuth',
					data: {
						code: uparams.code
					}
				},
				success: (res) => {
					console.log('member/h5WeixinAuth res', res.result);
					res = res.result;
					// uapi.msg(res, 5000)
					if (res.code == 0) {
						// 授权获取 openid
						this.h5WeixinOAuth({
							code: uparams.code,
							openid: res.datas.openid
						});

						// 调用 login 方法
						this.login(res);
					}
				}
			})
			//}
			// #endif

			uni.getStorage({
				key: '__version',
				success: (res) => {
					if (res.data) {
						// 比较版本号，当前是否为新版本
						if (uapi.compareVersion(config.version, res.data)) {
							// 清理缓存
							uni.removeStorage({
								key: '__usemall_login'
							});
						}
					}

					uni.setStorage({
						key: '__version',
						data: config.version
					})
				}
			})

			// #ifdef APP
			// 锁定横屏 
			// plus.screen.lockOrientation("landscape-primary");  
			// 锁定竖屏 
			plus.screen.lockOrientation("portrait-primary");
			// #endif

			if (uni.canIUse('getUpdateManager')) {
				const updateManager = uni.getUpdateManager();

				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					console.log(res.hasUpdate);
					if (res.hasUpdate) {
						updateManager.onUpdateReady(function(res) {
							uni.showModal({
								title: '更新提示',
								content: '新版本已经准备好，是否重启应用？',
								success(res) {
									if (res.confirm) {
										// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
										updateManager.applyUpdate();
									}
								}
							});
						});

						updateManager.onUpdateFailed(function(res) {
							// 新的版本下载失败
						});
					}
				});
			}

			// 自动刷新新的 token 
			db.on('refreshToken', ({
				token,
				tokenExpired
			}) => {
				console.log("refreshToken: ", {
					token,
					tokenExpired
				});
				this.token(token, tokenExpired);
			});

			db.on('error', (err) => {
				console.log('db err', err);
				if (err.code === "TOKEN_INVALID_WRONG_TOKEN") {
					uapi.msg('当前登录已失效，请重新登录')
					// token 已失效
					this.logout();
				}
			})

			// if (options && options.query && options.query.gcid) {
			// 	// 判断存在团长ID，跳转参团活动
			// 	const group_chief_id = options.query.gcid;
			// 	uni.$once('home-loaded', () => {
			// 		uni.navigateTo({
			// 			url: `/sub-marketing/pages/group-join?id=${group_chief_id}`
			// 		});
			// 	});
			// }

			// uni.onPushMessage((res) => {
			// 	console.log('unipush2.0 res', res);
			// })

			// #ifdef MP-WEIXIN
			// uniCloud.initSecureNetworkByWeixin();
			// #endif
		},
		onShow: function(options) {
			// 加载用户 Token 
			this.loadToken();

			console.log('App Show', options, this.member);

			let obj = {};
			if ([1011, 1012, 1013].includes(options.scene) && options.query) {
				uni.setStorageSync('__scene_query_q', options.query.q);
				if (options.query.q) {
					obj = this.resolveQueryq(options.query.q);
				}
			}

			if (options.query && (options.query.mid || obj.mid)) {
				// 存储分享者用户 id
				uni.setStorageSync('__use_share_mid', options.query.mid || obj.mid);
			}

			// #ifdef MP-WEIXIN
			let lopts = uni.getLaunchOptionsSync();
			console.log('mp-weixin onshow', options, lopts);

			// 
			if (lopts && lopts.query && lopts.query.share) {
				// is_share
				// todo: 调用分享获积分服务-api

			}
			// #endif			
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局字体图标和公共样式 */
	@import url("/components/iconfont/iconfont.css");
	@import url("/common/common.scss");
</style>
