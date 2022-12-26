const dotenv = require("dotenv");
// 定义全局系统环境变量
dotenv.config({ path: './.env' });
const express = require("express");
const app = express();
const port = process.env.INDEX_PORT; // 服务端口
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const Response = require("./utils/Response.js");
// 配置跨域
const cors = require("cors");
const utils = require("./utils/utils.js");
app.use(
  cors({
    origin: "*",
  })
);

// 解析post请求参数
app.use(express.urlencoded());

// 请求拦截器处理 全局验证token
app.use(function (req, resp, next) {
  //  拦截白名单
  if (  req.path == '/user/login'|| req.path == '/user/register') return next();

  // TODO 测试环境中，不做token拦截，直接执行后续业务(有些接口会受到影响)
   return next();

  // 执行token验证
  let token = utils.delBearer(req.headers["authorization"]);
  try {
    let payload = jwt.verify(token, JWT_SECRET_KEY);
    req.tokenPayload = payload  // 将token中存储的数据，直接复制给req，这样在后续业务中就可以使用req.tokenPayload获取这些信息
  } catch (error) {
    resp.send(Response.error(401, '用户验证失败，请重新登录'))
    return;
  }
  next(); // 继续后续业务的执行
});

// 引入外部路由
app.use(require("./router/user.js"));
// app.use(require("./router/drugs.js"));
app.use(require('./router/drugs'))
app.use(require('./router/hospital.js'))
app.use(require("./router/reminder"));
app.use(require("./router/news"));
app.use(require('./router/bible.js'))
app.use(require("./router/register"));
/**
 * 接口， 处理/请求
 */
app.get("/", (req, resp) => {
  resp.send("test");
});

app.listen(port, () => {
  console.log("[", port, "]社区医疗后端服务已启动...");
});
