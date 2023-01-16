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
      resp.send(Response.ok(null, '恭喜，注册成功！'));
    } else {
      resp.send(Response.error(400, '该身份证/手机号已被注册！'));
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
    if (dbres.length == 0) return resp.send(Response.error(400, '账号或密码不正确!')); 
    // 验证成功 生成token
    let { uid, name } = dbres[0];
    let payload = { uid, name };
    let token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '15d' }); // TODO 用于测试，发布时改成30d
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
  if (!uid) return resp.send(Response.error(400,  "uid not playload in token!" ));
  let sql = "update user set ? where uid=?";
  try {
    let dbres = await utils.query(sql, [{ avatar, address, update_time: utils.getDate() }, uid]);
    if (dbres.affectedRows != 1) return resp.send(Response.error( 400, "更新用户信息失败"));
    resp.send(Response.ok(null, "更新用户信息成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 获取用户健康信息
router.get("/user/health", async (req, resp) => {
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid || req.query.uid;
  if (!uid) return resp.send(Response.error(400,  "uid not playload in token!" ));
  // 查询返回
  let find_health_sql = `select * from health where uid=?`;
  try {
    let dbres = await utils.query(find_health_sql, [uid]);
    resp.send(Response.ok( dbres , "获取成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

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
  if (!uid) return resp.send(Response.error(400,  "uid not playload in token!" ));
  // 更新健康数据
  let insHealthySql = `update health set ? where uid=?`;
  try {
    let dbres = await utils.query(insHealthySql, [{ uid, height, weight, blood_ressure, blood_sugar, update_time: utils.getDateTime() }, uid]);
    if (dbres.affectedRows != 1) return resp.send(Response.error(400, "更新健康信息失败"));
    resp.send(Response.ok(null,"更新用户健康信息成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 查询用户病史数据
router.get("/user/medical_history", async (req, resp) => {
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.error(400,  "uid not playload in token!" ));
  // 查询返回
  let find_medhis_sql = `select * from medical_history where uid=?`;
  try {
    let dbres = await utils.query(find_medhis_sql, [uid]);
    resp.send(Response.ok( dbres , "获取成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 添加病史
router.post("/user/add_medical_history", async (req, resp) => {
  let { /* type, */ descs, medical_time } = req.body;
  // 表单验证
  let schema = Joi.object({
    // type: Joi.number().required(),
    descs: Joi.string().required(),
    medical_time: Joi.required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.error(400,  "uid not playload in token!" ));
  // 查询返回
  let add_medhis_sql = `insert into medical_history   
  (mid,uid,type,descs,medical_time) 
  values(?,?,?,?,?)`;
  try {
    await utils.query(add_medhis_sql, [null, uid, 0, descs, medical_time]);
    resp.send(Response.ok(null, "添加成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 删除病史数据
router.post("/user/del_medical_history", async (req, resp) => {
  let { mid } = req.body;
  // 表单验证
  let schema = Joi.object({
   mid: Joi.number().required(),
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid;
  if (!uid) return resp.send(Response.error(400,  "uid not playload in token!" ));
  // 查询返回
  let del_medhis_sql = `delete from medical_history where mid=? and uid=?`;
  try {
    await utils.query(del_medhis_sql, [mid, uid]);
    resp.send(Response.ok(null, "删除成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});
// 医生入驻功能(弃用)
// router.post("/user/doctor_cer", async (req, resp) => {
//   let { grade, good_at, avatar, gender, depa, did, hid } = req.body;
//   // 表单验证
//   let schema = Joi.object({
//     grade: Joi.required(),
//     good_at: Joi.string().required(),
//     avatar: Joi.string().required(),
//     gender: Joi.string().required(),
//     depa: Joi.string().required(),
//     did: Joi.number().required(),
//     hid: Joi.number().required()
//   });
//   let { error, value } = schema.validate(req.body);
//   if (error) return resp.send(Response.error(400, error));
//   // 从tokenPayload中拿到uid
//   let uid = req.tokenPayload.uid;
//   if (!uid) return resp.send(Response.error(400,  "uid not playload in token!" ));
//   // 查询返回
//   let doctor_cer_sql = `insert into resident_doctor   
//   (uid,grade,good_at,avatar,gender,depa,did,hid) 
//   values(?,?,?,?,?,?,?,?)`;
//   let update_user_sql = `update user set isdoctor=1 where uid=?`;
//   try {
//     await utils.query(doctor_cer_sql, [uid, grade, good_at, avatar, gender, depa, did, hid]);
//     await utils.query(update_user_sql, [uid]);
//     resp.send(Response.ok(null, "添加成功"));
//   } catch (error) {
//     resp.send(Response.error(500, error));
//   }
// });
// 医生入驻/添加医生功能
router.post("/user/doctor_cer", async (req, resp) => {
  let { name, grade, good_at, descs, avatar, gender, depa, did, hid } = req.body;
  // 表单验证
  let schema = Joi.object({
    uid:Joi.any(),
    name: Joi.string().required(),
    grade: Joi.required(),
    good_at: Joi.string().required(),
    descs: Joi.string().required(),
    avatar: Joi.string().required(),
    gender: Joi.string().required(),
    depa: Joi.string().required(),
    did: Joi.number().required(),
    hid: Joi.number().required()
  });
  let { error, value } = schema.validate(req.body);
  if (error) return resp.send(Response.error(400, error));
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid || req.body.uid;
  if (!uid) return resp.send(Response.error(400,  "uid not playload in token! or req" ));
  // 查询返回
  let isdoctor_sql = `select isdoctor from user where uid=?`;
  let doctor_cer_sql = `insert into doctor   
  (uid,name,grade,good_at,descs,avatar,gender,depa,did,hid) 
  values(?,?,?,?,?,?,?,?,?,?)`;
  let update_user_sql = `update user set isdoctor=1 where uid=?`;
  try {
   let resdb = await utils.query(isdoctor_sql, [uid]);
   // 已经认证请勿重复认证
   if(resdb[0]?.isdoctor == 1) return resp.send(Response.error(400, '已经认证请勿重复认证!'));
    await utils.query(doctor_cer_sql, [uid, name, grade, good_at, descs, avatar, gender, depa, did, hid]);
    await utils.query(update_user_sql, [uid]);
    resp.send(Response.ok(null, "认证成功"));
  } catch (error) {
    resp.send(Response.error(500, error));
  }
});

// 获取认证的医生信息
router.post("/user/cer_info", async (req, resp) => {
  // 从tokenPayload中拿到uid
  let uid = req.tokenPayload.uid || req.body.uid;
  if (!uid) return resp.send(Response.error(400,  "uid not playload in token! or req" ));
   // 查询返回
   let cer_info_sql = `select o.*,d.title d_title,h.title h_title,h.address h_addr
   from doctor o
     join depa d on o.did=d.did
     join hospital h on o.hid=h.hid
   where o.uid=?;`;
   try {
    let dbres = await utils.query(cer_info_sql, [uid]);
     resp.send(Response.ok(dbres, "获取成功"));
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