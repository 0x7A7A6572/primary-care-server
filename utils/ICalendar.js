const uuid = require('uuid');
const fs = require("fs");
class ICalendar {
  VERSION = '2.0';
  PRODID = '-//SQYL//SQYL Calendar//ZH';
  CALSCALE = 'GREGORIAN';
  METHOD = 'PUBLISH';
  SUMMARY = '用药提醒';
  UID = uuid.v4();
  DTSTART; DTEND; /* DTSTAMP; */
  DESCRIPTION;
  RRULE = {
    FREQ: 'DAILY',
    UNTIL: '',
    INTERVAL: 1
  };

  constructor( desc, dtstatr, dtend) {
    this.DESCRIPTION = desc;
    this.DTSTART = dtstatr;
    this.DTEND = dtend;
  }

  // 添加重复规则
  addRule(type, val) {
    this.RRULE[type] = val;
  }

  // 导出ics文件
  toICS() {
    let tempalte = `
BEGIN:VCALENDAR
VERSION:${this.VERSION}
PRODID:${this.PRODID}
CALSCALE:${this.CALSCALE}
METHOD:${this.METHOD}
BEGIN:VEVENT
SUMMARY:${this.SUMMARY}
UID:${this.UID}
DTSTART:${this.DTSTART}
DTEND:${this.DTEND}
DESCRIPTION:${this.DESCRIPTION}
RRULE:FREQ=${this.RRULE.FREQ};UNTIL=${this.RRULE.UNTIL};INTERVAL=${this.RRULE.INTERVAL}
END:VEVENT
END:VCALENDAR`;
    // 部署环境的文件路径兼容
    let pathSplit = process.OS = 'Windows_NT' ? '\\' : '/';
    let path = process.cwd() + `${pathSplit}static${pathSplit}ics${pathSplit}`;
    // 路径不存在则创建
    try { fs.accessSync(path) } catch (err) { fs.mkdirSync(path); };
    let icsOriginName = this.UID + '.ics';
    try {
      fs.writeFileSync(path + icsOriginName, tempalte);
      return  '/ics/' + icsOriginName;
    } catch (err) {
      return false;
    }
  }
}

module.exports = ICalendar;