// 引入连接池模块
const pool = require('./db');

const utils = {
  // promise封装mysql qurey
  query(opstions, values) {
    return new Promise((resolve, reject) => {
      pool.query(opstions, values, (err, r) => {
        if (err) return reject(err);
        resolve(r);
      })
    });
  },
  // 去除 中的Bearer 
  delBearer(token){
    return token?.replace("Bearer ","");
  },
  // 获取当前时间转字符串YYYY-MM-DD
  getDate() {
    let d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  },
  dateToTime(date = date.toString()) {
    return new Date(date)?.getTime() || 0;
  }
}
module.exports = utils;