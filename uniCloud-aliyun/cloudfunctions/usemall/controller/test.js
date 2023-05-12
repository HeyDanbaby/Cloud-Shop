'use strict';

const createConfig = require('uni-config-center');
const uidConfig = createConfig({
	pluginId: 'uni-id'
});

const usepayConfig = createConfig({
	pluginId: 'use-pay'
});
const {
	Controller
} = require('uni-cloud-router');

const redis = uniCloud.redis();

module.exports = class TestController extends Controller {
	
	async redisTest() {
		let start = Date.now();
		const token = 'eyJhbGciOiJ121212IUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MGI1ZDc5OGIxMDMxOTAwMDEyNWM4YjIiLCJyb2xlIjpbIm1lbWJlciJdLCJwZXJtaXNzaW9uIjpbXSwiaWF0IjoxNjIyNTI5OTQ0LCJleHAiOjE2MjMxMzQ3NDR9.DK343DTTLjagGUTs3DbmqmVenr5ICM1a0sA6-LQJN8M' + Date.now();
		const sign = this.service.md5.hex(token);
		console.log('sign', sign, Date.now() - start);
		
		start = Date.now();
		await redis.sadd('user-tokens', sign);
		console.log('redis', sign, Date.now() - start);
		
		start = Date.now();
		const token2 = 'eyJaaaaaaaaaaaaaaaaNiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MGI1ZDc5OGIxMDMxOTAwMDEyNWM4YjIiLCJyb2xlIjpbIm1lbWJlciJdLCJwZXJtaXNzaW9uIjpbXSwiaWF0IjoxNjIyNTI5OTQ0LCJleHAiOjE2MjMxMzQ3NDR9.DK343DTTLjagGUTs3DbmqmVenr5ICM1a0sA6-LQJN8M' + Date.now();
		const sign2 = this.service.md5.hex(token2);
		console.log('sign2', sign2, Date.now() - start);
		
		start = Date.now();
		await redis.sadd('user-tokens', sign2);
		console.log('redis2', sign2, Date.now() - start);
		
		start = Date.now();
		const res = await redis.sismember('user-tokens', sign); 
		console.log('res', res, Date.now() - start);
	}
	
	async md5Test() {
		let start = Date.now();
		// token 
		const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MGI1ZDc5OGIxMDMxOTAwMDEyNWM4YjIiLCJyb2xlIjpbIm1lbWJlciJdLCJwZXJtaXNzaW9uIjpbXSwiaWF0IjoxNjIyNTI5OTQ0LCJleHAiOjE2MjMxMzQ3NDR9.DK343DTTLjagGUTs3DbmqmVenr5ICM1a0sA6-LQJN8M';
		const sign = this.service.md5.hex(token);
		
		console.log('sign', sign, Date.now() - start);
		
		start = Date.now();
		const res2 = await this.db.collection('uni-id-users').doc('60b5db71827eca0001795dea').field({ username: 1 }).get();
		console.log('db token', res2, Date.now() - start);
		
		start = Date.now();
		const res = await this.db.collection('uni-id-users').where({
			token: token
		}).field({ username: 1 }).get();
		console.log('db token', res, Date.now() - start);
		
		return sign;
	}
	
	// 查找差异数据
	async diffUsers() {
		let response = {
			result: 0
		};
		const start = Date.now();
		
		let userRes;
		let uids = [];
		
		let page = 1;
		let rows = 500;
		
		do {
			// 批量处理用户数据
			userRes = await this.db.collection('usemall-member')
				.orderBy('create_time', 'desc')
				.skip((page - 1) * rows)
				.limit(rows)
				.get();
			
			uids = [...uids, ...userRes.data.map(x => x._id)];
			console.log('uids', uids.length);
			page++;
		} while (userRes.data.length >= 500);
		
		userRes = await this.db.collection('uni-id-users').where({
			_id: this.db.command.nin(uids),
			role: 'member'
		})
		.field({
			username: true,
			mobile: true,
			role: true,
		})
		.limit(rows)
		.get();
		
		console.log('未匹配数据数', userRes.data.length);
		
		uids = userRes.data.map(x => x._id);
		response.datas = userRes.data;
		
		userRes = await this.db.collection('usemall-member').where({
			_id: this.db.command.in(uids)
		})
		.field({
			member_nickname: 1,
			member_mobile: 1,
			member_name: 1
		})
		.limit(rows)
		.get();
		console.log('核实未匹配数据数', userRes.data.length);
		
		let end = Date.now();
		console.log(`耗时：${end - start}ms`);
		response.duration = end - start;
		
		return response;
	}

	async lottery() {
		const response = {
			code: 1,
			datas: {},
			msg: ''
		}
		
		// 随机查询一条数据
		const res = await this.db.collection('usemall-lottery-pool')
			.aggregate()
			.project({
				idx: 1,
				lottery_id: 1
			})
			.sample({
				size: 1
			})
			.end();
			
		console.log('res', res);

		return response;
	}

	async getWxpayConfig() {
		console.log(usepayConfig.config("wxpay.appid"));
	}

	async sendmsg() {
		const response = {
			code: 1,
			datas: {},
			msg: ''
		}

		const start = Date.now();
		try {
			// 待发货通知
			// 不需要 await，只需发送请求即可
			uniCloud.httpclient.request(`${uidConfig.config('message-notify.url')}/101`, {
				method: 'post',
				headers: {
					'message-notify-key': uidConfig.config('message-notify.key')
				},
				data: {
					id: '1234567890',
					scene: 101,
					uname: 'Usecloud',
					title: `拼团订单 1234567890 已付款`,
					type: `发货订单 - 微信小程序 - 微信支付:0.02`,
					goods: `用云电商 uniCloud 版`
				},
				timeout: 30 * 1000,
				contentType: 'json',
				dataType: 'json'
			});
		} catch (e) {
			console.log('message-notify err', e);
		}

		response.datas = `${Date.now() - start}ms`;
		return response;
	}

	async overtime() {

		console.log(await this.service.h5wx.get_access_token());

		console.log(this.service.h5wx.sha1(
			'jsapi_ticket=HoagFKDcsGMVCIY2vOjf9sYIJymqnqufzmb27r-ZEJp5sgidt5EB1kTwAf8xrkAdKNEQsi1oot5AfBtlagpYsg&noncestr=hzn76x4hyr7&timestamp=1660835785&url=http://localhost:8080/'
			));

		if (Date.now() > 1660316530887) {
			this.throw('ERROR', '请联系管理员')
		}

		return Date.now();
	}

	// 格式化日期
	date() {
		let response = {
			code: 1,
			msg: '',
			datas: {}
		};

		const nowdate = Date.now();
		const utc8date = this.service.utils.toDateUTC8(Date.now());
		response.datas = {
			now: nowdate,
			nowformat: this.service.utils.formatdate(nowdate, 'yyyy年MM月dd日 hh:mm:ss'),
			utc8: utc8date,
			utc8format: this.service.utils.formatdate(utc8date, 'yyyy年MM月dd日 hh:mm:ss'),
		}
		response.code = 0;

		return response;
	}

	desz() {
		const response = {
			code: 1,
			datas: {},
			msg: ''
		}

		response.datas.desz = this.service.utils.desz('18825281536');

		return response;
	}

	async usersMobileLogin() {
		let response = {
			result: 0
		};
		const start = new Date().getTime();

		// 批量处理用户数据
		let userRes = await this.db.collection('uni-id-users')
			.where({
				username: this.db.command.exists(true),
				role: this.db.command.all(['member'])
			})
			.orderBy('register_date', 'asc')
			.limit(500)
			.get();
		let createTime = 0;

		do {
			userRes.data && userRes.data.forEach(async (x) => {
				await this.db.collection('uni-id-users').doc(x._id).update({
					mobile: x.username,
					mobile_confirmed: 1
		 	});

				response.result++;
				createTime = x.register_date;
			});

			userRes = await this.db.collection('uni-id-users')
				.where({
					username: this.db.command.exists(true),
					role: this.db.command.all(['member']),
					register_date: this.db.command.gt(createTime)
				})
				.orderBy('register_date', 'asc')
				.limit(500)
				.get();

		} while (userRes.data && userRes.data.length > 0);

		let end = new Date().getTime();
		console.log(`耗时：${end - start}ms`);
		response.duration = end - start;

		return response;
	}

	async sendMessage() {
		let {
			cid,
			uid
		} = this.ctx.data;

		const res = {
			datas: {}
		}

		const uniPush = uniCloud.getPushManager({
			// appId: '__UNI__63109F4'
			appId: '__UNI__C51FBF2'
		});

		// cid = "79a1187ea082a7d52af0050ac10da21f";
		cid = "4bfd907a29027d01acfefa030d5484a9";

		res.datas = await uniPush.sendMessage({
			// "user_id": uid || "f1dedd58625ace8d003053404b9ef9ce",
			// "cid": cid,
			"push_clientid": cid,
			"title": "系统通知",
			"content": "订单已付款，可安排发货",
			"payload": {
				"type": "im",
				"data": {
					"type": "single",
					"body": "您好！",
					"from_uid": "f1dedd58625ace8d003053404b9ef9ce", // 这里是uni-id的用户id
					"to_uid": uid || "f1dedd58625ace8d003053404b9ef9ce",
					"time": Date.now()
				}
			}
		});

		console.log('res.datas ', res.datas);

		return res;
	}


	async getip() {
		const res = await this.curl('https://imcore.use-cloud.com/im/ip', {
			nestedQuerystring: true,
			method: 'get',
			headers: {
				'Content-Type': 'application/josn'
			},
			dataType: 'json',
			data: {

			}
		});

		return res.data;
	}

	async getConfig() {
		const config = require('../config.json');

		console.log('utils.config', this.service.utils.getConfig());
		return config;
	}

	async updateUndefUser() {

		const userRes = await this.db.collection('usemall-member').where({
			member_name: new RegExp('undefined')
		}).get();

		const users = userRes.data;

		for (let i = 0; i < users.length; i++) {
			const user = users[i];

			await this.db.collection('usemall-member').doc(user._id).update({
				member_name: user.member_name.replace('undefined', '又是云')
			})
			await this.db.collection('uni-id-users').doc(user._id).update({
				nickname: user.member_name.replace('undefined', '又是云')
			})
		}

		return users;
	}

}
