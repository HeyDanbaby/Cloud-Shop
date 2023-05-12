'use strict';

const uidObj = require('uni-id');

const {
	Controller
} = require('uni-cloud-router');

const dbcmd = uniCloud.database().command;
const $ = dbcmd.aggregate;

module.exports = class MessageController extends Controller {

	// √ 未读数
	async unread() {
		let response = {
			code: 1,
			datas: []
		};

		const start = Date.now();

		const uid = this.ctx.auth.uid;

		let where_obj = {
			del_uids: dbcmd.neq(uid),
			to_uids: dbcmd.or(dbcmd.exists(false), dbcmd.eq(uid)),
			read_uids: dbcmd.neq(uid)
		};
		
		let res = await this.db.collection('usemall-message')
			.aggregate()
			.match(where_obj)
			.group({
				_id: null,
				num: $.sum(1)
			})
			.end()

		const [data = {}] = res.data;
		response.datas = data;

		const end = Date.now();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.duration = `耗时：${end - start}ms`;
		return response;
	}

	// √ 数据
	async data() {
		let response = {
			code: 1,
			datas: []
		};

		const start = Date.now();

		const uid = this.ctx.auth.uid;

		let where_obj = {
			del_uids: dbcmd.neq(uid),
			to_uids: dbcmd.or(dbcmd.exists(false), dbcmd.eq(uid)),
			read_uids: dbcmd.neq(uid),
		};
		
		let res = await this.db.collection('usemall-message')
			.aggregate()
			.match(where_obj)
			.sort({
				create_time: -1
			})
			.group({
				_id: '$tid',
				doc: $.first('$$ROOT'),
				num: $.sum(1)
			})
			.end()

		response.datas = res.data;

		const end = Date.now();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.duration = `耗时：${end - start}ms`;
		return response;
	}

	// √ 列表
	async list() {
		let response = {
			code: 1,
			datas: []
		};
		
		const { tid } = this.ctx.data;
		
		const start = Date.now();
		const uid = this.ctx.auth.uid;

		let where_obj = {
			del_uids: dbcmd.neq(uid),
			to_uids: dbcmd.or(dbcmd.exists(false), dbcmd.eq(uid)),
			tid: parseInt(tid)
		};
		
		let res = await this.db.collection('usemall-message')
			.aggregate()
			.match(where_obj)
			.sort({
				create_time: -1
			})
			.end()

		response.uid = uid;
		response.datas = res.data;
		
		const end = Date.now();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.duration = `耗时：${end - start}ms`;
		return response;
	}
	
	// √ 已读
	async read() {
		let response = {
			code: 1,
			datas: []
		};
		
		const {
			id
		} = this.ctx.data;
		
		const start = Date.now();
		const uid = this.ctx.auth.uid;
	
		let res = await this.db.collection('usemall-message')
			.doc(id)
			.update({
				read_uids: dbcmd.addToSet(uid)
			});
	
		response.datas = res;
	
		const end = Date.now();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.duration = `耗时：${end - start}ms`;
		return response;
	}
	
	// 批量删除
	async remove() {
		let response = {
			code: 1,
			datas: []
		};
		
		const {
			ids
		} = this.ctx.data;
		
		const start = Date.now();
		const uid = this.ctx.auth.uid;
	
		let res = await this.db.collection('usemall-message')
			.where({
				_id: dbcmd.in(ids)
			})
			.update({
				del_uids: dbcmd.addToSet(uid)
			});
	
		response.datas = res;
	
		const end = Date.now();
		console.log(`耗时：${end - start}ms`);
		response.code = 0;
		response.duration = `耗时：${end - start}ms`;
		return response;
	}
	
}
