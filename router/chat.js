const express = require('express');
const router = express.Router();
const Joi = require('joi');
const pool = require('../utils/db.js');
const Response = require('../utils/Response.js');
const utils = require('../utils/utils.js');

// 查询问诊会话列表
router.post('/chat/list', async (req, resp) => {
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid || req.body.uid;;
  if (!uid) return resp.send(Response.error(400, "uid not playload in token or req!"));
  //执行查询任务
  let sql = `select m.*,d.avatar d_avatar,d.name d_name,d.grade d_grade, u.name u_name, u.avatar u_avatar from inquiries_msg m 
  join doctor d on m.did=d.uid
  join user u on m.uid=u.uid
  where m.uid=? or m.did=?
  group by sid desc;`;
  try {
    let resdb = await utils.query(sql, [uid, uid]);
    resp.send(Response.ok(resdb, "查询成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 查询会话的所有消息
router.post('/chat/details', async (req, resp) => {
  let { sid } = req.body;
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid || req.body.uid;;
  if (!uid) return resp.send(Response.error(400, "uid not playload in token or req!"));
  //执行查询任务
  let sql = `select * from msg where sid=?`;
  try {
    let resdb = await utils.query(sql, [sid]);
    resp.send(Response.ok(resdb, "查询成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});
module.exports = router;