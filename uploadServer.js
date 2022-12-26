const dotenv = require("dotenv");
// 定义全局系统环境变量
dotenv.config({ path: './.env' });
const express = require('express');
const app = express();
const port = process.env.UPLOAD_PORT;
const Response = require('./utils/Response.js');
const BASE  = `http://localhost:${port}/`;
// const BASE  = `http://部署的地址:${port}/`  // TODO发布时改成部署地址

// 配置跨域
const cors = require('cors');
app.use(cors({
    origin: "*"
}));

// 配置multer中间件，处理文件上传
const multer = require('multer');
const uuid = require('uuid');
const uploadTools = multer({
    storage: multer.diskStorage({ // 该存储方案将会把文件直接存入磁盘
        destination: (req, file, callback)=>{
            callback(null, 'static')
        },
        filename: (req, file, callback)=>{
            // 通过file，获取原始文件名     huangbo.jpg
            let name = file.originalname    
            // 截取源文件的后缀 .jpg  .png  ....
            let ext = name.substring(name.lastIndexOf('.'))
            // 生成一个随机文件名，调用callback返回即可
            let newName = uuid.v4() + ext
            callback(null, newName)
        }
    })
});

// 配置static目录为静态资源托管文件夹 ， 这样就可以直接通过http://ip:port/文件名  访问static目录下的资源
app.use(express.static('static'));

app.post('/upload', uploadTools.single('file'),  (req, resp)=>{
    // multer中间件将会把文件信息存入：req.files
    let url = BASE + req.file.filename;
    resp.send(Response.ok(url));
});

app.listen(port, ()=>{
    console.log("[",port,"]上传文件服务已启动...");
});

