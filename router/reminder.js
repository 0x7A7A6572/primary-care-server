const express = require("express");
const router = express.Router();
const Joi = require("joi");
const ICalendar = require("../utils/ICalendar.js");
const Response = require("../utils/Response.js");
const utils = require("../utils/utils.js");


/**
 * 用药提醒模块
 */

// 查询用药提醒列表
router.get("/reminder/list", async (req, resp) => {
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.error(400, "uid not playload in token!"));
  // 查询返回
  let find_reminders_sql = `select * from med_reminder where uid=?`;
  try {
    let dbres = await utils.query(find_reminders_sql, [uid]);
    resp.send(Response.ok({ ...dbres }, "获取成功"));
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
  if (!uid) return resp.send(Response.error(400, "uid not playload in token!"));
  // 查询返回
  let del_reminders_sql = `delete from med_reminder where rid=? and uid=?`;
  try {
    let dbres = await utils.query(del_reminders_sql, [rid, uid]);
    resp.send(Response.ok({}, "删除成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 新增用药提醒
router.post("/reminder/add", async (req, resp) => {
  let { medname, units, dtstatr, dtend, freq, until, intervalue, dose } = req.body;
  // 表单验证
  let schema = Joi.object({
    medname: Joi.string().required(),
    units: Joi.string().required(),
    dtstatr: Joi.date().required(),
    dtend: Joi.date().required(),
    freq: Joi.string().required(),
    until: Joi.date().required(),
    intervalue: Joi.number().required(),
    dose: Joi.string().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.error(400, "uid not playload in token!"));
  // 查询返回
  let add_reminders_sql = `insert into  med_reminder
  (uid,medname,dtstatr, dtend, freq, until, intervalue,units, dose,create_time) 
  values(?,?,?,?,?,?,?,?,?,?)`;
  try {
    await utils.query(add_reminders_sql,
      [uid, medname, dtstatr, dtend, freq, until, intervalue, units, dose, utils.getDateTime()]);
    resp.send(Response.ok({}, "添加成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 生成日程提醒链接
router.post("/reminder/ics", async (req, resp) => {
  let { rid } = req.body;
  // 表单验证
  let schema = Joi.object({
    rid: Joi.number().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  // 从tokenPayload中拿到uid
  // let uid = req.tokenPayload.uid;
  // if (!uid) return resp.send(Response.error(400, "uid not playload in token!"));
  let update_ics_sql = `update med_reminder set icsurl=? where rid=?`;

  let find_medhis_sql = 'select * from med_reminder where rid=?';

  let icsurl;

  try {
    let resdb = await utils.query(find_medhis_sql, [rid]);
    let { freq, until, intervalue, medname, dtstatr, dtend, units, dose } = resdb[0];
    // 创建ics对象
    ics = new ICalendar(`${medname} - ${units}/${dose}`, dtstatr, dtend);
    ics.addRule('FREQ', freq);
    ics.addRule('UNTIL', until);
    ics.addRule('INTERVAL', intervalue);
    icsurl = ics.toICS();
    if (!icsurl) return resp.send(Response.error(400, "生成失败！"));
  } catch (error) {
    return resp.send(Response.error(500, error));
  }

  // 更新数据
  try {
    await utils.query(update_ics_sql, [icsurl, rid]);
    resp.send(Response.ok({icsurl}, "生成成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }

})

module.exports = router;