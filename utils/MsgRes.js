class MsgRes {
  // 定义消息类型
  static MSG_TYPE = {
    ON_LINE: 'online', // 在线
    VISIT_START: 'visit-start', // 问诊开始
    VISIT_END: 'visit-end',     // 问诊结束
    REGISTER: 'register', // 聊天接入预验证用户
    USER: 'uchat', // 用户消息
    SYSTEM: 'schat' // 系统消息
  }
  static system(msg, type = 'text') {
    return [this.MSG_TYPE.SYSTEM, {
      msg,
      type,
      time: new Date().getTime(),
      role: "system"
    }]
  }
  static visitStart(msg,code,sid){
    return [this.MSG_TYPE.VISIT_START, {
      msg, 
      type: 'text', code, sid,
      time: new Date().getTime(),
      role: "system"
    }]
  }
  static user(msg ,type = 'text'){
    return [this.MSG_TYPE.USER, {
      msg, type,
      time: new Date().getTime(),
      role: "others"
    }]
  }
  static base(msg,role="system",type = 'text',){
    return {
      msg, type,
      time: new Date().getTime(),
      role
    }
  }
}
module.exports = MsgRes;
