// 引入连接池模块
const pool = require('./db');

const utils = {
  // promise封装mysql qurey
  query(opstions, values) {
    return new Promise((resolve, reject) => {
      pool.query(opstions, values, (err, r) => {
        if (err) return reject(err);
        // OkPacket {
        //   fieldCount: 0,
        //   affectedRows: 1,
        //   insertId: 1,
        //   serverStatus: 2,
        //   warningCount: 0,
        //   message: '',
        //   protocol41: true,
        //   changedRows: 0
        // }
        resolve(r);
      })
    });
  },
  // 获取当前时间转字符串YYYY-MM-DD
  getDate() {
    let d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  }
}
module.exports = utils;