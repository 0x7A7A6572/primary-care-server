const express = require("express");
const router = express.Router();
const Joi = require("joi");
const pool = require("../utils/db.js");
const Response = require("../utils/Response.js");


// 新增挂号信息
router.post('/register/add', async (req, res) => {
  let { uid, did
    , yy_time,
    state, hid,
    create_time,
    update_time
  } = req.body;
  let schema = Joi.object({
    uid: Joi.string().required(),
    did: Joi.number().required(),
    hid: Joi.number().required(),
    yy_time: Joi.string().required(),
    state: Joi.number().required(),
    create_time: Joi.string().required(),
    update_time: Joi.string().required()
  })
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  try {
    let sql = "INSERT INTO `order_yy` (uid,did,yy_time,state,create_time,update_time,hid) VALUES(?,?,?,?,?,?,?);"
    let result = await pool.querySync(sql, [uid, did
      , yy_time,
      state,
      create_time,
      update_time, hid]);
    res.send(
      Response.ok({ result })
    );
  } catch (error) {
    res.send(Response.error(error));
  }
})

router.post('/register/list', async (req, res) => {
  let { uid
  } = req.body;
  let schema = Joi.object({
    uid: Joi.string().required(),

  })
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  try {
    let sql = `SELECT o.*,d.name,a.title,a.address,a.hid
        FROM order_yy o join doctor d on o.did=d.did
        join hospital a 
        where o.uid=?
        GROUP BY yy_time desc;`
    let result = await pool.querySync(sql, [uid]);
    res.send(
      Response.ok({ result })
    );
  } catch (error) {
    res.send(Response.error(error));
  }
})

// 修改预约挂号信息  
router.post('/register/updata', async (req, res) => {
  let { state, uid, oid} = req.body;
  let schema = Joi.object({
    oid: Joi.number().required(),
    state: Joi.number().required(),
    uid: Joi.string().required(),
  })
  let { error, value } = schema.validate(req.body);
  if (error) {
    res.send(Response.error(400, error));
    return; // 结束
  }
  try {
    let sql = `update order_yy set state=? where uid=? and oid=?`
    let result = await pool.querySync(sql, [state, uid, oid]);
    res.send(
      Response.ok({ result })
    );
  } catch (error) {
    res.send(Response.error(error));
  }
})
module.exports = router;
