set names utf8;
drop database if exists sqyl_db;
create database sqyl_db default charset = utf8;
use sqyl_db;

-- 医院信息
drop table if exists hospital;
create table if not exists hospital(
  hid int primary key  comment "医院id",
  title varchar(50) not null comment "医院名",
  logo varchar(200) not null  comment "医院logo",
  grade varchar(50) not null  comment "医院等级",
  type varchar(200)  comment "医院类型",
  -- telephone varchar(100) comment "预约挂号电话",
  address varchar(200) comment "医院地址"
  -- cityid int comment "医院所在城市id",
  -- province int comment "医院所在省份id"
);

-- 科室信息
drop table if exists depa;
create table if not exists depa(
  did int primary key  comment "科室id/编号",
  title varchar(50) not null comment "科室名",
  hid int not null  comment "所属医院"
);

-- 医生信息
drop table if exists doctor;
create table doctor(
  id int primary key,
  name varchar(50) not null comment "姓名",
  grade varchar(10) not null  comment "等级（医师/护士..）",
  good_at varchar(50) not null comment "擅长领域",
  avatar varchar(200) comment "医生头像",
  -- gender boolean not null comment "医生性别",
  hospital_id int comment "绑定医院id"
);

-- 药品信息
drop table if exists drugs;
create table drugs(
  id int primary key,
  signid varchar(20) comment "注册号",
  name varchar(50) comment "药品名称",
  type varchar(10) comment "剂型",
  spec varchar(50) comment "规格",
  pro_unit varchar(20) comment "生产单位",
  code varchar(15) comment "药品编码"
);



-- 用户信息
drop table if exists user;
create table user(
  uid int primary key,
  name varchar(20) not null comment "姓名",
  phone varchar(13),
  -- married boolean not null comment "是否已婚",
  gender boolean not null comment "性别",
  -- age tinyint not null comment "年龄",
  birthday date not null  comment "生日",
  shenfenzheng varchar(18) not null comment "居民身份证",
  address varchar(50) comment "用户地址", 
  create_time datetime  not null comment "用户创建时间",
  update_time datetime  not null comment "资料更新时间"
);

-- 用户健康数据
drop table if exists health;
create table  health(
  uid int primary key comment "绑定的用户id",
  height int comment "身高",
  weight int comment "体重",
  blood_ressure varchar(5) comment "血压",
  blood_sugar varchar(5) comment "血糖",
  update_time datetime  not null comment "资料更新时间"
);

-- 用户病例数据 （暂不考虑）
-- drop table if exists case_data;
-- create table case_data(
--   cid int primary key  comment "病例编号",
--   uid int comment "绑定的用户id",
-- 入院日期 感染日期 报告 入院诊断 报告科室
-- );

-- 预约挂号订单
drop table if exists order_yy;
create table order_yy(
  oid int primary key comment "预约号id",
  uid int not null comment "就诊的用户id",
  did int not null comment "预约的医生id",
  yy_time datetime  not null comment "预约的时间",
  state tinyint default 0 comment "订单状态（0：待诊断/1：正在诊断/2：诊断完成/）",
  create_time datetime  not null comment "订单创建时间",
  update_time datetime  not null comment "订单更新时间"
);

-- 病史数据

-- 用药提醒数据
drop table if exists med_reminder;
create table med_reminder(
  rid int primary key comment "编号",
  uid int not null comment "提醒的用户id",
  medname varchar(15) not null comment "药品名称",
  reminder_time datetime  not null comment "提醒的时间",
  company varchar(10) not null comment  "用药单位",
  dose varchar(10)  not null comment "剂量",
  create_time datetime  not null comment "订单创建时间"
);

-- 疾病分类数据
DROP TABLE IF EXISTS `subject`;
CREATE TABLE `subject`  (
  `sid` int(11) NOT NULL COMMENT '病种分类id',
  `subject` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '病种',
  PRIMARY KEY (`sid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

SET FOREIGN_KEY_CHECKS = 1;

-- 具体疾病数据
DROP TABLE IF EXISTS `disease`;
CREATE TABLE `disease`  (
  `did` int(11) NOT NULL COMMENT '病种详细分类id',
  `Disease` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '病种',
  `fid` int(11) NOT NULL COMMENT '病种分类外键id',
  PRIMARY KEY (`did`) USING BTREE,
  CONSTRAINT `disease_ibfk_1` FOREIGN KEY (`did`) REFERENCES `subject` (`sid`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

SET FOREIGN_KEY_CHECKS = 1;

-- 新闻数据
drop table if exists news;
create table news(
  nid int primary key comment "新闻编号",
  hot int default 0 comment "热度",
  title varchar(20)  not null comment "标题",
  content varchar(3000) comment "新闻内容",
  create_time datetime  not null comment "新闻发布时间"
);
-- 社区活动数据

-- -----------------------------------------------
-- 社区药房模块（好像有点多 做不做待定）

-- 药品（商品）: 编号 名称 价格 库存 状态 ..
-- 订单 ：订单编号 收货地址编号 订单状态 ...
-- 物流信息 物流单号 订单编号 物流状态 ...

-- 用户收货地址(和用户信息里的地址区分，用于药房收货地址)
drop table if exists addrlist;
create table addrlist(
  aid int primary key comment "地址编号",
  uid int not null comment "绑定的用户id",
  name varchar(10) comment "收货人",
  phone varchar(11)  comment "手机号",
  address varchar(50) not null comment "地址详细信息"
);

