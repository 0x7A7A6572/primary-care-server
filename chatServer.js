const dotenv = require("dotenv");
// 定义全局系统环境变量
dotenv.config({ path: './.env' });
const express = require('express');
const jwt = require("jsonwebtoken");
const ChatUtils = require('./utils/ChatUtils');
const socket = require('socket.io');
const app = express();
const http = require('http');
const utils = require("./utils/utils");
// const fs = require("fs");
// const https = require("https");
const port = process.env.CHAT_PORT;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
// 消息体对象
const MsgRes = require("./utils/MsgRes");
// app.use(express.static('public'));
// app.use(cors({origin: "*",}));
const server = http.createServer(app);

// const io = new socket.Server(server, {
//   cors: { origin: '*' }
// });
const io = socket(server, {
  cors: { origin: '*' }
});
// 定义消息类型
const MSG_TYPE = {
  ON_LINE: 'online', // 上线
  OFF_LINE: 'offline', // 离线
  VISIT_START: 'visit-start', // 问诊开始
  VISIT_END: 'visit-end',     // 问诊结束
  // NEW_MSG_NOTIFY: 'new-msg',
  USER: 'uchat', // 用户消息
  SYSTEM: 'schat' // 系统消息
}
// 定义用户状态
const USER_STATUS = {
  ON_LINE: 1, // 在线
  OFF_LINE: 0 // 离线
}

const unSendMsgs = new Map();
const chatUsers = new Map();

// 监听 sockte 
io.on('connection', user => {
  // 上线连接 
  user.on(MSG_TYPE.ON_LINE, Msg => {
    let { uid, token } = Msg;
    verifyToken(uid, token).then(async res => {
      user.uid = uid; // 发送者
      user.token = token;

      if (chatUsers.has(uid)) {
        chatUsers.get(uid).status = USER_STATUS.ON_LINE;
      } else {
        chatUsers.set(uid, {
          suid: user.id,
          status: USER_STATUS.ON_LINE
        });
      }
      // 检查是否有未接收的消息
      if (!unSendMsgs.has(uid)) return;
      unSendMsgs.get(uid).forEach(m => {
        user.emit(MSG_TYPE.USER, m);
      });
      unSendMsgs.delete(uid);
      // console.log("chatUsers:", chatUsers);
    }).catch(err => {
      // console.log("err:", err);
      user.emit(...MsgRes.system('认证信息验证错误'));
    });
  });
  
  // 下线通知
  user.on(MSG_TYPE.OFF_LINE, Msg=>{
    user.disconnect();
  })

  // 问诊开始
  user.on(MSG_TYPE.VISIT_START, async Msg => {
    let { uid, touid, descs, type } = Msg;
    // 会话创建
    let sid = await ChatUtils.createInquiries(uid, touid, type, descs, utils.getDateTime());
    // console.log("cres: ", sid);
    // 如果返回fasle 则提示会话创建失败
    if (sid == false) return user.emit(...MsgRes.system('问诊发起失败'));
    // 否则返回会话id（数据库）
    user.emit(...MsgRes.visitStart('问诊会话开始', 0x7A7A6572, sid));
  });
  // 问诊结束
  user.on(MSG_TYPE.VISIT_END, Msg => {
    ChatUtils.closeInquiries(Msg.sid);
    // console.log(Msg.msg,Msg.endid);
    user.to(chatUsers.get( Msg.touid).suid).emit(...MsgRes.visitEnd('问诊会话结束', Msg.touid, Msg.sid));
  });
  // 用户私聊通道 
  user.on(MSG_TYPE.USER, Msg => {
    let { uid, token, touid, msg, sid, type, time } = Msg;
    // console.log('用户发送的消息体', Msg);
    verifyToken(uid, token).then(() => {
      // user.emit(MSG_TYPE.SYSTEM, { msg: `chatUsers.has(touid):${chatUsers.has(touid)}` });

      if (chatUsers.has(touid) && chatUsers.get(touid).status == USER_STATUS.ON_LINE) {
        // user.to(chatUsers.get(uid).suid).emit(MSG_TYPE.SYSTEM, { msg: '对方在线状态' });
        user.to(chatUsers.get(touid).suid).emit(...MsgRes.user(msg,type,sid));
      } else {
        addUnSendMsgs(touid, { ...MsgRes.base(msg, 'others'), sender: uid })
        user.emit(...MsgRes.system('对方当前不在线，消息已保存'));
        // console.log("对方当前不在线,消息存入unSendMsgs列表");
      }
      // 存入数据库
      ChatUtils.pushMsg({
        sid,
        content: msg,
        type,sendtime: time,
        sender: uid,
        recipient: touid,
        state: 1 // TODO 已读未读暂不控制
      });
    }).catch(err => {
      console.log("err:", err);
      user.emit(...MsgRes.system('发送消息错误'));
    });

  });


  // 断开连接监听
  user.on('disconnect', reason => {
    console.log('disconnect: ', reason);
    if (chatUsers.has(user.uid)) {
      chatUsers.get(user.uid).status = USER_STATUS.OFF_LINE;
      chatUsers.delete(user.uid);
    }
  });

})

// 验证用户token
function verifyToken(uid, token) {
  //验证token
  return new Promise((res, rej) => {
    // console.log({token, JWT_SECRET_KEY})
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) return rej(err);
      // console.log("payload.uid != uid ?", payload.uid != uid);
      if (payload.uid != uid) return rej("非法用户！");
      // 验证通过
      res(payload);
    })
  })

}

// 添加未读消息到未读集合
function addUnSendMsgs(key, msg) {
  if (!unSendMsgs.has(key)) {
    let arr = [];
    arr.push(msg);
    unSendMsgs.set(key, arr);
  } else {
    unSendMsgs.get(key).push(msg)
  }
}



server.listen(port, function () {
  console.log("[", port, "]聊天服务器已启动...");
});

// 配置https
// if(process.env.HTTPS_KEY && process.env.HTTPS_CRT){
//   const httpsOption = {
//     key: fs.readFileSync(process.env.HTTPS_KEY),
//     cert: fs.readFileSync(process.env.HTTPS_CRT)
//   }
//   const httpsServer = https.createServer(httpsOption, app);
//   httpsServer.listen(port, function () {
//     console.log("[", port, "]聊天服务器已启动...");
//   });
// }

