## 目录结构说明

```sh
├─doc # 一些说明文档
│  └─sql # 数据库初始化脚本
├─router # 路由
│  ├─...
├─static # 静态资源
│  └─upload # 上传文件服务存储位置
├─test # 测试文件（.gitignore忽略）
├─utils # 工具类
│  ├─db.js # 数据库连接池
│  ├─utils.js # 封装的一写功能
│  └─Response.js # 请求响应处理对象
├─index.js  # 主接口服务器
├─uploadServer.js  # 上传文件服务器
├─chatServer.js  # 聊天服务器
├─.env  # 配置

```

## 运行项目
```sh
## 启动所有服务
 pm2 start .\index.js .\chatServer.js .\uploadServer.js
```

## 接口文档地址
https://console-docs.apipost.cn/preview/81f4754cdd5a0c2d/6d3f156aaa7cdf6f



## 工作划分

| 铭     | 浩     | 亮     |
| ------ | ------ | ------ |
| 用户问诊聊天服务丶<br>用药提醒/登录注册/用户<br>/新闻模块接口开发 | 预约挂号/医药查询/<br>医院/科室/医生综合信息模块接口开发 | 医疗宝典模块接口开发 |

