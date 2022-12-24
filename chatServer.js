const dotenv = require("dotenv");
// 定义全局系统环境变量
dotenv.config({ path: './.env' });
const express = require('express');
const jwt = require("jsonwebtoken");
const cors = require('cors');
const socket = require('socket.io');
const app = express();
const http = require('http');
const utils = require("./utils/utils");
const port = process.env.CHAT_PORT;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
app.use(express.static('public'));

const server = http.createServer(app);

const io = new socket.Server(server, {
  cors: { origin: '*' }
});

// 定义消息类型
const MSG_TYPE = {
  REGISTER: 'register', // 聊天接入预验证用户
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
  user.emit(MSG_TYPE.SYSTEM, { msg: '连接成功服务器，请发送注册信息验证！' });
  // 聊天初始化验证
  user.on(MSG_TYPE.REGISTER, Msg => {
    let { uid, token, touid } = Msg;
    verifyToken(uid, token).then(res => {
      user.uid = uid; // 发送者
      user.token = token;
      user.touid = touid;
      user.recipient = touid; // 接收者

      if (chatUsers.has(uid)) {
        chatUsers.get(uid).status = USER_STATUS.ON_LINE;
      } else {
        chatUsers.set(uid, {
          suid: user.id,
          status: USER_STATUS.ON_LINE
        });
      }
      user.emit(MSG_TYPE.SYSTEM, { msg: '注册信息验证成功！' });

      // 检查是否有未接收的消息
      if (!unSendMsgs.has(uid)) return;
      unSendMsgs.get(uid).forEach(m => {
        user.emit(MSG_TYPE.USER, m);
      });
      unSendMsgs.delete(uid);
      // console.log("chatUsers:", chatUsers);
    }).catch(err => {
      // console.log("err:", err);
      user.emit(MSG_TYPE.SYSTEM, { msg: '注册信息验证错误', err });
    });
  });

  // 用户私聊通道 
  user.on(MSG_TYPE.USER, Msg => {
    let { uid, token, touid, msg } = Msg;
    // console.log('用户发送的消息体', Msg, user.id);
    verifyToken(uid, token).then(() => {
      // user.emit(MSG_TYPE.SYSTEM, { msg: `chatUsers.has(touid):${chatUsers.has(touid)}` });

      if (chatUsers.has(touid) && chatUsers.get(touid).status == USER_STATUS.ON_LINE) {
        user.to(chatUsers.get(uid).suid).emit(MSG_TYPE.SYSTEM, { msg: '对方在线状态' });
        user.to(chatUsers.get(touid).suid).emit(MSG_TYPE.USER, { msg, sendTime: utils.getDateTime() });
      } else {
       
        addUnSendMsgs(touid, { msg, sendTime: utils.getDateTime(), sender: uid })
        user.emit(MSG_TYPE.SYSTEM, { msg: '对方当前不在线，消息已保存' });
        console.log("对方当前不在线,消息存入unSendMsgs列表");
      }
    }).catch(err => {
      console.log("err:", err);
      user.emit(MSG_TYPE.SYSTEM, { msg: '发送消息错误', err });
    });

  });

  // 用户断开连接
  user.on('disconnect', reason => {
    // console.log('disconnect: ', reason);
    if (chatUsers.has(user.uid)) {
      chatUsers.get(user.uid).status = USER_STATUS.OFF_LINE;
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


