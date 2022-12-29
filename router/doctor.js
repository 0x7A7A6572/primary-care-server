const express = require("express");
const router = express.Router();
const Joi = require("joi");
const pool = require("../utils/db.js");
const Response = require("../utils/Response.js");

// 医生模糊查询
router.get('/doctor/search', async (req, res) => {
  let { key, hid, did } = req.query;
  let schema = Joi.object({
    key: Joi.string().required(),
    hid: Joi.number(),
    did: Joi.number()
  })
  let { error, value } = schema.validate(req.query);
  if (error) return res.send(Response.error(400, error));

  try {
     let sql = `
     select o.*,d.title d_title,h.title h_title,h.address h_addr
        from doctor o
            join depa d on o.did=d.did
        join hospital h on o.hid=h.hid
         where  ( name like ? or good_at like ? )  
         ${hid ? ' and o.hid=?' : '' } ${did ? ' and o.did=?' : '' }
        GROUP BY name desc`;
    let result = await pool.querySync(sql, [`%${key}%`,`%${key}%`,hid,did]);
    res.send(Response.ok(result));
  } catch (error) {
    res.send(Response.error(error));
  }
});

// 医生查询 分页
router.get('/doctor/list', async (req, res) => {
  let { page, pagenum } = req.query;
  let schema = Joi.object({
    page: Joi.number().required(),
    pagenum: Joi.number().required(),
  })
  let { error, value } = schema.validate(req.query);
  if (error) return res.send(Response.error(400, error));
  try {
    // let sql = "select * from doctor limit ?,?";
   let sql = `SELECT o.*,d.title d_title,h.title h_title,h.address h_addr
    FROM doctor o
        join depa d on o.did=d.did
    join hospital h on o.hid=h.hid
    group by o.name desc 
    limit ?,? ;`;
    let result = await pool.querySync(sql, [parseInt(page),parseInt(pagenum)]);
    res.send(Response.ok(result));
  } catch (error) {
    res.send(Response.error(error));
  }
});

// 专家推荐医生 (暂)
router.get('/doctor/recommend', async (req, res) => {
  try {
    let sql = "select * from doctor where doctor.grade = '主任医师' group by name limit 10";
    let result = await pool.querySync(sql, []);
    res.send(Response.ok(result));
  } catch (error) {
    res.send(Response.error(error));
  }
});
module.exports = router;