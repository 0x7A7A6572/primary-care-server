const dotenv = require("dotenv");
// 定义全局系统环境变量
dotenv.config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const socket = require('socket.io');
const app = express();
const http = require('http');
const port = process.env.CHAT_PORT || 6000;

app.use(express.static('public'));

const server = http.createServer(app);

const io = new socket.Server(server, {
  cors: { origin: '*' }
});

// 定义消息类型
const MSG_TYPE = {
  USER: 1, // 用户消息
  SYSTEM: 0, // 系统消息
}

// 监听利用 sockte 长连接方式 访问的用户
io.on('connection', user => {
  console.log('user:', user);
  user.on(MSG_TYPE.USER,  Msg =>{
   let {uid, token, msg} = Msg;

   verifyToken(uid, token).then(res=>{

   }).catch(err=>{
    user.emit(MSG_TYPE.SYSTEM,{ msg: '发送消息错误', err});
   });
    console.log('用户发送的消息体',Msg);
  })
})

// 验证用户token
function verifyToken(uid, token) {
  //验证token
  return new Promise((res, rej => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
      if (err) return rej(err);
      if(payload.uid != uid) return rej("非法用户！");
      // 验证通过
      res(payload);
    })
  }))

}

server.listen(port, function () {
  console.log("[", port, "]聊天服务器已启动...");
});