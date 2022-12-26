const express = require("express");
const router = express.Router();
const Joi = require("joi");
const pool = require("../utils/db.js");
const Response = require("../utils/Response.js");


// 新增挂号信息
router.post('/register/add',async (req,res)=>{
    let {uid,did
        ,yy_time,
        state,
        create_time,
        update_time
    }=req.body;
    let schema = Joi.object({
        uid: Joi.number().required(), 
        did: Joi.number().required(), 
        yy_time:Joi.string().required(), 
        state: Joi.number().required(),
        create_time:Joi.string().required(),
        update_time:Joi.string().required()
      })
      let { error, value } = schema.validate(req.body);
      if (error) {
        res.send(Response.error(400, error));
        return; // 结束
      }
      try {
        let sql = "INSERT INTO `order_yy` (uid,did,yy_time,state,create_time,update_time) VALUES(?,?,?,?,?,?);"
        let result = await pool.querySync(sql, [uid,did
            ,yy_time,
            state,
            create_time,
            update_time]);
        res.send(
          Response.ok({  result })
        );
      } catch (error) {
        res.send(Response.error(error));
      }
})

router.post('/register/list',async (req,res)=>{
    let {uid
    }=req.body;
    let schema = Joi.object({
        uid: Joi.number().required(), 
       
      })
      let { error, value } = schema.validate(req.body);
      if (error) {
        res.send(Response.error(400, error));
        return; // 结束
      }
      try {
        let sql = `SELECT o.yy_time,d.name,a.address,o.oid,d.id,a.hid
        FROM order_yy o join doctor d on o.did=d.did
        join hospital a on a.hid>0
        where o.uid=2
        GROUP BY yy_time desc;`
        let result = await pool.querySync(sql, [uid]);
        res.send(
          Response.ok({  result })
        );
      } catch (error) {
        res.send(Response.error(error));
      }
})

// 修改预约挂号信息  
router.post('/register/updata',async (req,res)=>{
  let {state,
    uid
  }=req.body;
  let schema = Joi.object({
      state: Joi.number().required(), 
      uid: Joi.number().required(), 
    })
    let { error, value } = schema.validate(req.body);
    if (error) {
      res.send(Response.error(400, error));
      return; // 结束
    }
    try {
      let sql = `update order_yy set state=? where uid=?`
      let result = await pool.querySync(sql, [state,uid]);
      res.send(
        Response.ok({  result })
      );
    } catch (error) {
      res.send(Response.error(error));
    }
})
module.exports = router;
