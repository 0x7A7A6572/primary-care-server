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
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
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
  if (error) return resp.send(Response.error(400, error));

  // 查询用户是否已被注册
  let findUserSql = `select shenfenzheng from user where shenfenzheng=?`;
  // 执行添加操作
  let insertSql = `insert into user   
    (uid,name,phone,gender,birthday,shenfenzheng,pwdmd5,address,isdoctor,create_time,update_time) 
    values 
     (?,?,?,?,?,?,?,?,?,?,?)`;
  try {
    // 查询该用户是否已被注册
    let haved = await utils.query(findUserSql, [shenfenzheng]);

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
  let { phone, pwdmd5 } = req.body
  // 表单验证
  let schema = Joi.object({
    phone: Joi.string().required().pattern(new RegExp('^\\w{11,18}$')), // 必填
    pwdmd5: Joi.string().required(), // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));

  // 查询数据库，账号密码是否填写正确
  let checkPwd_sql = "select * from user where (phone=? and pwdmd5=?) or (shenfenzheng=? and pwdmd5=?)";
  try {
    let dbres = await utils.query(checkPwd_sql, [phone, pwdmd5, phone, pwdmd5]);
    if (dbres.length == 0) return resp.send(Response.ok({ code: 400, msg: '账号或密码不正确' }));
    // 验证成功 生成token
    let { uid, name } = dbres[0];
    let payload = { id: uid, name: name };
    let token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1d' }); // 1d用于测试，发布时改成30d
    resp.send(Response.ok({ user: fllterUserData(dbres[0]), token }));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});


// 过滤用户信息字段(密码不返回)
function fllterUserData(u){
  return {
    uid: u.uid,
    name: u.name,
    phone: u.phone,
    gender: u.gender,
    birthday: u.birthday,
    shenfenzheng: u.shenfenzheng,
    address: u.address,
    isdoctor: u.isdoctor,
    create_time: u.create_time
  }
}



module.exports = router;