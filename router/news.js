const express = require("express");
const router = express.Router();
const Joi = require("joi");
const pool = require("../utils/db.js");
const Response = require("../utils/Response.js");

// 新闻列表
router.get('/news/list', async (req, resp) => {
  let { page, pagenum } = req.query;
  let schema = Joi.object({
    page: Joi.number().required(),
    pagenum: Joi.number().integer().max(100).required(),
  })
  let { error, value } = schema.validate(req.query);
  if (error) return resp.send(Response.error(400, error));
  try {
    let sql = "select nid,hot,title,cover,create_time from news limit ?,?";
    let dbres = await pool.querySync(sql, [(page - 1) * pagenum, parseInt(pagenum)]);
    // 执行查询总条目数
    let sql2 = "select count(*) from news";
    let result2 = await pool.querySync(sql2, []);
    let total = result2[0].count;
    resp.send(Response.ok({ code: 200, msg: "获取成功", page, total, data: dbres }));
  } catch (error) {
    resp.send(Response.error(error));
  }
});

// 新闻详情
router.post('/news/detail', async (req, resp) => {
  let { nid } = req.body;
  let schema = Joi.object({
    nid: Joi.number().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  try {
    let sql = "select * from news where nid=?";
    let dbres = await pool.querySync(sql, [nid]);
    resp.send(Response.ok({ code: 200, msg: "获取成功", data: dbres[0] }));
  } catch (error) {
    resp.send(Response.error(error));
  }
});

// 添加新闻
router.post('/news/add', async (req, resp) => {
  let { hot, title, cover, content, create_time } = req.body;
  let schema = Joi.object({
    hot: Joi.number().default(0),
    title: Joi.string().required(),
    cover: Joi.string().required(),
    content: Joi.string().required(),
    create_time: Joi.date().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  try {
    let sql = "insert into news(hot, title, cover, content, create_time) values(?,?,?,?,?)";
    let dbres = await pool.querySync(sql, [hot,title,cover,content,create_time]);
    resp.send(Response.ok({ code: 200, msg: "添加成功"}));
  } catch (error) {
    console.log("error: ",error);
    resp.send(Response.error(error));
  }
});
module.exports = router;