/*
 *  问诊聊天服务工具类
 */
  
// 引入mysql连接池
// const pool = require("../utils/db.js");
const utils = require("./utils.js");

class ChatUtils {
  // 创建会话
 static async createInquiries(uid,did,type,descs,stime){
  let check_sql = `select * from inquiries_msg where uid=? and did=? and state=0;`;
  let sql = `insert into inquiries_msg   
   (uid,did,type,descs,stime) 
   values(?,?,?,?,?)`;
   try{
    let checkres = await utils.query(check_sql, [uid,did]);
    if(checkres.length > 0) return checkres[0].sid;
    let dbres = await utils.query(sql, [uid,did,type,descs,stime]);
    // console.log(dbres)
    // 返回插入的sid 
    return dbres.insertId;
   }catch(err){
    console.log(err);
    return false
   }
 }
 // 结束会话
 static async closeInquiries(sid){
  console.log('closeInquiries：',sid)
  let sql = `update inquiries_msg   
   set state=1,etime=? where sid=?`;
   try{
    let dbres = await utils.query(sql, [utils.getDateTime(),sid]);
    // console.log(dbres);
    return true;
   }catch(err){
    console.log(err);
    return false;
   }
 }
 // 消息保存
 static async pushMsg(msg){
  let {sid,content,type,sendtime,sender,recipient,state} = msg;
  let sql = `insert into msg(sid,content,type,sendtime,sender,recipient,state)
   values(?,?,?,?,?,?,?);`;
   try{
    console.log("pushMsg:",[sid,content,type,sendtime,sender,recipient,state]);
    let dbres = await utils.query(sql, [sid,content,type,sendtime,sender,recipient,state]);
    console.log(dbres);
    return true;
   }catch(err){
    console.log(err);
    return false;
   }
 }
}
module.exports = ChatUtils;
