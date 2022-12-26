const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Response = require("../utils/Response.js");
const utils = require("../utils/utils.js");


// create table med_reminder(
//   rid int auto_increment primary key comment "编号",
//   uid varchar(18) not null comment "提醒的用户id",
//   medname varchar(15) not null comment "药品名称",
//   reminder_time datetime not null comment "提醒的时间",
//   units varchar(10) not null comment "用药单位",
//   dose varchar(10) not null comment "剂量",
//   create_time datetime not null comment "创建时间"
// );

/**
 * 用药提醒模块
 */

// 查询用药提醒列表
router.get("/reminder/list", async (req, resp) => {
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.ok({ code: 400, msg: "uid not playload in token!" }));
  // 查询返回
  let find_reminders_sql = `select * from med_reminder where uid=?`;
  try {
    let dbres = await utils.query(find_reminders_sql, [uid]);
    resp.send(Response.ok({ code: 200, msg: "获取成功", data: dbres }));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 删除提醒
router.post("/reminder/del", async (req, resp) => {
  let { rid } = req.body;
  // 表单验证
  let schema = Joi.object({
    rid: Joi.number().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.ok({ code: 400, msg: "uid not playload in token!" }));
  // 查询返回
  let del_reminders_sql = `delete from med_reminder where rid=? and uid=?`;
  try {
    let dbres = await utils.query(del_reminders_sql, [rid, uid]);
    resp.send(Response.ok({ code: 200, msg: "删除成功", data: dbres }));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 新增用药提醒
router.post("/reminder/add", async (req, resp) => {
  let { medname, units, reminder_time, dose } = req.body;
  // 表单验证
  let schema = Joi.object({
    medname: Joi.string().required(),
    units: Joi.string().required(),
    reminder_time: Joi.date().required(),
    dose: Joi.string().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.ok({ code: 400, msg: "uid not playload in token!" }));
  // 查询返回
  let add_reminders_sql = `insert into med_reminder(rid,uid,medname,reminder_time,units,dose,create_time) values(?,?,?,?,?,?,?)`;
  try {
    let dbres = await utils.query(add_reminders_sql, [null, uid, medname, reminder_time, units, dose, utils.getDateTime()]);
    resp.send(Response.ok({ code: 200, msg: "添加成功", data: dbres }));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});


module.exports = router;