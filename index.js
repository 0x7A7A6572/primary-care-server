const express = require("express");
const app = express();
const port = process.env.INDEX_PORT; // 服务端口
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const Response = require("./utils/Response.js");

// 配置跨域
const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

// 解析post请求参数
app.use(express.urlencoded());


// 引入外部路由
app.use(require("./router/user.js"));


/**
 * 接口， 处理/请求
 */
app.get("/", (req, resp) => {
  resp.send("test");
});

app.listen(port, () => {
  console.log("[",port,"]社区医疗后端服务已启动...");
});
