const express = require("express");
const router = express.Router();
const Joi = require("joi");
const pool = require("../utils/db.js");
const Response = require("../utils/Response.js");

// 医院模糊查询
router.get('/hospital/name',async (req,res)=>{
    let name = req.query.name;
    let schema=Joi.object({
        name: Joi.string().required(),
    })
    let { error, value } = schema.validate(req.query);
    if (error) {
      res.send(Response.error(400, error));
      return; // 结束
    }
    try {
        let sql = "select * from hospital where  title like ?";
        let result = await pool.querySync(sql, [`%${name}%`]);
        res.send(
            Response.ok({result })
          );
    }catch (error) {
        res.send(Response.error(error));
      }
})


// 医院列表分页
router.post('/hospital/limit',async (req,res)=>{
    let {page,pagenum}=req.body;
    let schema = Joi.object({
        page: Joi.number().required(), 
        pagenum: Joi.number().integer().max(100).required(), 
      })
      let { error, value } = schema.validate(req.body);
      if (error) {
        res.send(Response.error(400, error));
        return; // 结束
      }
      try {
        let startIndex = (page - 1) * pagenum;
        let size = parseInt(pagenum);
        let sql = "select * from hospital limit ?,?";
        let result = await pool.querySync(sql, [ startIndex, size]);
        // 执行查询总条目数
        let sql2 = "select count(*) as count from hospital";
        let result2 = await pool.querySync(sql2);
        let total = result2[0].count;
        res.send(
          Response.ok({ page: parseInt(page), pagenum: size, total, result })
        );
      } catch (error) {
        res.send(Response.error(error));
      }
})


// 查询医院的科室列表  根据医院id 查询科室列表

router.post('/hospital/subject',async (req,res)=>{
    let {hid}=req.body;
    let schema = Joi.object({
        hid: Joi.number().required(), 
      })
      let { error, value } = schema.validate(req.body);
      if (error) {
        res.send(Response.error(400, error));
        return; // 结束
      }
      try {
        let sql = "select * from depa where hid=?";
        let result = await pool.querySync(sql, [hid]);
        // 执行查询总条目数
        res.send(
          Response.ok({result })
        );
      } catch (error) {
        res.send(Response.error(error));
      }
})
module.exports = router;