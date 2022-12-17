drop database sqyl_db if exists;
create database sqyl_db;
use sqyl_db;
-- 医生信息
create table if not exists doctor(
  id int primary key,
  name varchar(50) not null comment "姓名",
  grade varchar(10) not null  comment "等级（医师/护士）";
  good_at varchar(50) not null  comment "擅长领域",
  avatar varchar(200)  comment "医生头像",
  hospital_id int comment "绑定医院id",
);

-- 医院信息
create table if not exists hospital(
  id int primary key,
  title varchar(50) not null comment "医院名",
  detail varchar(1000) not null  comment "医院介绍";
  grade varchar(50) not null  comment "医院等级",
  type varchar(200)  comment "医院类型",
  telephone varchar(20) comment "预约挂号电话",
  cityid int comment "医院所在城市id",
  province int comment "医院所在省份id"
);

-- 药品信息
create table if not exists drugs(
  id int primary key,
  signid varchar(20) comment "注册号",
  name varchar(50) comment "药品名称",
  type varchar(10) comment "剂型",
  spec varchar(50) comment "规格",
  pro_unit varchar(20) comment "生产单位",
  code varchar(15) comment "药品编码"
);

-- 用户信息
create table if not exists user(
  uid primary key,
  name varchar(20) not null,
  phone varchar(13),
  married boolean not null comment "是否已婚"
  gender boolean not null comment "性别",
  age tinyint not null comment "年龄",
  shenfenzheng varchar(18) comment "居民身份证"
);

-- 健康数据
create table if not exists health(
  uid primary key comment "绑定的用户id",
  height int comment "身高",
  weight int comment "体重",
  blood_ressure int comment "血压",
  blood_sugar int comment "血糖"
);

