/**
 * 用户模块接口
 */
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Response = require("../utils/Response.js");
// 封装的工具类
const utils = require("../utils/utils");
// 引入mysql连接池
const pool = require("../utils/db.js");

// 用户注册
router.post("/user/register", async (req, resp) => {
  let {
    name,
    phone,
    gender,
    birthday,
    shenfenzheng,
    pwdmd5
  } = req.body; // post请求参数在req.body中
  // 表单验证
  let schema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    gender: Joi.number().required(),
    birthday: Joi.string().required(),
    shenfenzheng: Joi.string().required(),
    pwdmd5: Joi.string().required()
  });

  let { error, value } = schema.validate(req.body);
  if (error) {
    resp.send(Response.error(400, error));
    return; // 结束
  }
  // 查询用户是否已被注册
  let findUserSql = `select shenfenzheng from user where shenfenzheng=?`;
  // 执行添加操作
  let insertSql = `insert into user   
    (uid,name,phone,gender,birthday,shenfenzheng,pwdmd5,address,isdoctor,create_time,update_time) 
    values 
     (?,?,?,?,?,?,?,?,?,?,?)`;
  try {
    console.log("??")
    // 查询该用户是否已被注册
    let haved = await utils.query(findUserSql, [shenfenzheng]);
    console.log("haved",haved)
   
    if (haved.length == 0) {
      // 插入数据
      await utils.query(insertSql, [null, name,
        phone, gender, birthday, shenfenzheng,
        pwdmd5, null, 0, utils.getDate(), utils.getDate()]);
      resp.send(Response.ok({ code: 200, msg: '恭喜，注册成功！' }));
    } else {
      resp.send(Response.ok({ code: 400, msg: '该身份证已被注册！' }));
    }
  } catch (err) {
    resp.send(Response.error(500, err));
  }
});

// 用户登陆接口
router.post("/user/login", async (req, resp) => {
  
})

module.exports = router;