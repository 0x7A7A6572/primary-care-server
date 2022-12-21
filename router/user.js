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
    uid,
    name,
    phone,
    gender,
    birthday,
    pwdmd5
  } = req.body; // post请求参数在req.body中
  // 表单验证
  let schema = Joi.object({
    uid: Joi.string().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    gender: Joi.number().required(),
    birthday: Joi.string().required(),
    pwdmd5: Joi.string().required()
  });

  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));

  // 查询用户是否已被注册
  let find_user_sql = `select uid from user where uid=?`;
  // 执行添加操作
  let add_user_sql = `insert into user   
    (uid,name,phone,gender,birthday,pwdmd5,address,isdoctor,create_time,update_time) 
    values 
     (?,?,?,?,?,?,?,?,?,?)`;
  let add_healthy_sql = `insert into health   
    (uid,height,weight,blood_ressure,blood_sugar,update_time) 
    values 
     (?,?,?,?,?,?)`;
  try {
    // 查询该用户是否已被注册
    let haved = await utils.query(find_user_sql, [uid]);

    if (haved.length == 0) {
      // 插入用户数据
      await utils.query(add_user_sql, [uid, name,
        phone, gender, birthday, pwdmd5, null, 0,
        utils.getDate(), utils.getDate()]);
      // 插入健康数据
      await utils.query(add_healthy_sql, [uid, 0, 0, "-", "-", utils.getDate()]);
      resp.send(Response.ok({ code: 200, msg: '恭喜，注册成功！' }));
    } else {
      resp.send(Response.ok({ code: 400, msg: '该身份证/手机号已被注册！' }));
    }
  } catch (err) {
    resp.send(Response.error(500, err));
  }
});

// 用户登陆接口
router.post("/user/login", async (req, resp) => {
  let { phone, pwdmd5 } = req.body;
  // 表单验证
  let schema = Joi.object({
    phone: Joi.string().required().pattern(new RegExp('^\\w{11,18}$')), // 必填
    pwdmd5: Joi.string().required(), // 必填
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));

  // 查询数据库，账号密码是否填写正确
  let checkPwd_sql = "select * from user where (phone=? and pwdmd5=?) or (uid=? and pwdmd5=?)";
  try {
    let dbres = await utils.query(checkPwd_sql, [phone, pwdmd5, phone, pwdmd5]);
    if (dbres.length == 0) return resp.send(Response.ok({ code: 400, msg: '账号或密码不正确' }));
    // 验证成功 生成token
    let { uid, name } = dbres[0];
    let payload = { uid, name };
    let token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1d' }); // 1d用于测试，发布时改成30d
    resp.send(Response.ok({ user: fllterUserData(dbres[0]), token }));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 更新用户基本信息接口
router.post("/user/update", async (req, resp) => {
  let { avatar, address } = req.body;
  // 表单验证
  let schema = Joi.object({
    avatar: Joi.string().required(),
    address: Joi.string().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.ok({ code: 400, msg: "uid not playload in token!" }));
  let sql = "update user set ? where uid=?";
  try {
    let dbres = await utils.query(sql, [{ avatar, address, update_time: utils.getDate() }, uid]);
    if (dbres.affectedRows != 1) return resp.send(Response.ok({ code: 400, msg: "更新用户信息失败" ,uid}));
    resp.send(Response.ok({ code: 200, msg: "更新用户信息成功" }));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
})

// 更新用户健康信息
router.post("/user/update_health", async (req, resp) => {
  let { height, weight, blood_ressure, blood_sugar } = req.body;
  // 表单验证
  let schema = Joi.object({
    height: Joi.number().required(),
    weight: Joi.number().required(),
    blood_ressure: Joi.required(),
    blood_sugar: Joi.required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.ok({ code: 400, msg: "uid not playload in token!" }));
  // 更新健康数据
  let insHealthySql = `update health set ? where uid=?`;
  try {
    let dbres =  await utils.query(insHealthySql, [{ uid, height, weight, blood_ressure, blood_sugar, update_time: utils.getDateTime() }, uid]);
    if (dbres.affectedRows != 1) return resp.send(Response.ok({ code: 400, msg: "更新健康信息失败" ,uid}));
    resp.send(Response.ok({ code: 200, msg: "更新用户健康信息成功" }));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
})

// 过滤处理用户信息字段(密码不返回)
function fllterUserData(u) {
  return {
    uid: u.uid,
    name: u.name,
    avatar: u.avatar,
    phone: u.phone,
    gender: u.gender,
    birthday: u.birthday,
    address: u.address,
    isdoctor: u.isdoctor,
    create_time: utils.dateToTime(u.create_time)
  }
}



module.exports = router;