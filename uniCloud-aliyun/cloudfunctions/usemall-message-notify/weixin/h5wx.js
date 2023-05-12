
'use strict';

const createConfig = require('uni-config-center');
const uidConfig = createConfig({
	pluginId: 'uni-id'
});

const db = uniCloud.database();
const dbcmd = db.command;

const { 
	wxapi,
	utils: wxutils
} = require('use-api');

const utils = require('../utils');

module.exports = {
	// 获取消息类型
	async get_messages(scene) {
		const messageRes = await db.collection('usemall-message-type').where({
			state: 1,
			scene: scene
		}).get();
		
		const [message] = messageRes.data;
		
		return message;
	},
	/**
	 * 100订单相关通知
	 * 	101待发货通知
	 * 	102待收货通知
	 */
	async send_tpl_100(openid, req) {
	
		const res = await wxapi.send_tpl(openid, 'UNS7kAJ4MYUBKEq1TvQdrJLRrs8F-oyXU7UhXho6K1M', {
			"url": "https://usemall-h5-wx.use-cloud.com",
			"client_msg_id": Date.now(),
			"color": "#ff6a6c",
			"data": {
				"first": {
					"value": req.title
				},
				"tradeDateTime": {
					"value": utils.formatdate(utils.toDateUTC8(Date.now())),
					"color": "#173177"
				},
				"orderType": {
					"value": req.type,
					"color": "#173177"
				},
				"customerInfo": {
					"value": req.uname,
					"color": "#173177"
				},
				"orderItemName": {
					"value": "下单商品",
					"color": "#000"
				},
				"orderItemData": {
					"value": req.goods,
					"color": "#173177"
				},
				"remark": {
					"value": `\r\n${req.remark || '请及时登录管理后台查看并处理。'}`,
				}
			}
		});
	
		return res;
	},
	// 101待发货通知
	async send_tpl_101(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(101);
		if (message && message._id && message.uids.length) {
			for (let i = 0; i < message.uids.length; i++) {
				const openid = message.uids[i];
				// 发送模板消息
				res.push(await this.send_tpl_100(openid, req));
			}
		}
		return res;
	},
	// 102待收货通知
	async send_tpl_102(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(102);
		if (req.openid && message && message._id) {
			res.push(await this.send_tpl_100(req.openid, req));
		}
		return res;
	},
	/**
	 * 200售后相关通知
	 * 	201退款申请通知
	 * 	202退货申请通知
	 * 	203换货申请通知
	 * 
	 * 	204退款成功通知
	 * 	205退款拒绝通知
	 * 
	 * 	206退货已同意通知
	 * 	207退货拒绝通知
	 * 	208退货退款成功通知
	 * 
	 * 	209换货已同意通知
	 * 	210换货拒绝通知
	 * 	211换货已寄通知
	 * 
	 * 	212提醒寄回通知
	 */
	async send_tpl_200(openid, req) {
		
		const res = await wxapi.send_tpl(openid, 'OrmqsnxALvEa1t6ZrpLxLQz6fBM6jl1izK9pSdlWwXE', {
			"url": "https://usemall-h5-wx.use-cloud.com",
			"client_msg_id": Date.now(),
			"color": "#ff6a6c",
			"data": {
				"first": {
					"value": req.title
				},
				"HandleType": {
					"value": req.type,
					"color": "#173177"
				},
				"Status": {
					"value": req.status,
					"color": "#173177"
				},
				"RowCreateDate": {
					"value": utils.formatdate(utils.toDateUTC8(Date.now())),
					"color": "#173177"
				},
				"LogType": {
					"value": req.reason,
					"color": "#173177"
				},
				"remark": {
					"value": `\r\n${req.remark || '请及时登录管理后台查看并处理。'}`,
					"color": "#173177"
				}
			}
		});
		
		return res;
	},
	// 201退款申请通知
	// 202退货申请通知
	// 203换货申请通知
	// 204退款成功通知
	// 205退款失败通知
	// 206退货已同意
	// 207退货拒绝
	// 208退货退款成功
	// 209换货已同意
	// 210换货拒绝
	// 211换货已邮寄
	// 212提醒寄回货物
	async send_tpl_aftersale(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(req.scene);
		if (message && message._id && message.uids.length) {
			for (let i = 0; i < message.uids.length; i++) {
				const openid = message.uids[i];
				// 发送模板消息
				res.push(await this.send_tpl_200(openid, req));
			}
		}
		return res;
	},
	/**
	 * 300提现相关通知
	 * 	301分销提现通知
	 * 	302零钱提现通知
	 * 
	 * 	303分销提现成功通知
	 * 	304零钱提现成功通知
	 * 
	 * 	305分销提现拒绝通知
	 * 	306零钱提现拒绝通知
	 */
	async send_tpl_300(openid, req) {
		
		const res = await wxapi.send_tpl(openid, 'qGbCW11YE_dBtdfcPcUN43-l8CDTDIjKhJqRudmSyos', {
			"url": "https://usemall-h5-wx.use-cloud.com",
			"client_msg_id": Date.now(),
			"color": "#ff6a6c",
			"data": {
				"first": {
					"value": req.title
				},
				"keyword1": {
					"value": req.uname,
					"color": "#173177"
				},
				"keyword2": {
					"value": utils.formatdate(utils.toDateUTC8(Date.now())),
					"color": "#173177"
				},
				"keyword3": {
					"value": req.money,
					"color": "#173177"
				},
				"keyword4": {
					"value": req.way,
					"color": "#173177"
				},
				"remark": {
					"value": `\r\n${req.remark || '请及时登录管理后台查看并处理。'}`,
					"color": "#173177"
				}
			}
		});
		
		return res;
	},
	// 301分销提现通知
	async send_tpl_301(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(301);
		if (message && message._id && message.uids.length) {
			for (let i = 0; i < message.uids.length; i++) {
				const openid = message.uids[i];
				// 发送模板消息
				res.push(await this.send_tpl_300(openid, req));
			}
		}
		return res;
	},
	// 302零钱提现通知
	async send_tpl_302(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(302);
		if (message && message._id && message.uids.length) {
			for (let i = 0; i < message.uids.length; i++) {
				const openid = message.uids[i];
				// 发送模板消息
				res.push(await this.send_tpl_300(openid, req));
			}
		}
		return res;
	},
	// 303分销提现成功
	async send_tpl_303(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(303);
		if (req.openid && message && message._id) {
			res.push(await this.send_tpl_300(req.openid, req));
		}
		return res;
	},
	// 304零钱提现成功
	async send_tpl_304(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(304);
		if (req.openid && message && message._id) {
			res.push(await this.send_tpl_300(req.openid, req));
		}
		return res;
	},
	// 305分销提现失败
	async send_tpl_305(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(305);
		if (req.openid && message && message._id) {
			res.push(await this.send_tpl_300(req.openid, req));
		}
		return res;
	},
	// 306零钱提现失败
	async send_tpl_306(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(306);
		if (req.openid && message && message._id) {
			res.push(await this.send_tpl_300(req.openid, req));
		}
		return res;
	},
	/**
	 * 400反馈相关通知
	 * 	401用户提交反馈
	 * 	402反馈结果通知
	 */
	async send_tpl_400(openid, req) {
		
		const res = await wxapi.send_tpl(openid, '4krbHGitfLSb0NpciaBwxcj5nLSAyfOd1Y4Mbun8ckU', {
			"url": "https://usemall-h5-wx.use-cloud.com",
			"client_msg_id": Date.now(),
			"color": "#ff6a6c",
			"data": {
				"first": {
					"value": req.title
				},
				"keyword1": {
					"value": req.uname,
					"color": "#173177"
				},
				"keyword2": {
					"value": utils.formatdate(utils.toDateUTC8(Date.now())),
					"color": "#173177"
				},
				"keyword3": {
					"value": req.content,
					"color": "#173177"
				},
				"remark": {
					"value": `\r\n${req.remark || '请及时登录管理后台查看并处理。'}`,
					"color": "#173177"
				}
			}
		});
		
		return res;
	},
	// 401用户提交反馈
	async send_tpl_401(req) {
		const res = [];
		// 消息
		const message = await this.get_messages(401);
		if (message && message._id && message.uids.length) {
			for (let i = 0; i < message.uids.length; i++) {
				const openid = message.uids[i];
				// 发送模板消息
				res.push(await this.send_tpl_400(openid, req));
			}
		}
		return res;
	}
}
