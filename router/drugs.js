const express = require("express");
const router = express.Router();
const Joi = require("joi");
const pool = require("../utils/db.js");
const Response = require("../utils/Response.js");



// 模糊查询药品列表
router.post('/search/drugs',async (req,res)=>{
    // let sql="select * from drugs where  name like ? limit ?,?";
    let {name1,page,pagenum}=req.body;
    let schema = Joi.object({
        name1: Joi.string().required(), 
        page: Joi.number().required(), 
        pagenum: Joi.number().integer().max(100).required(), 
      })
      let { error, value } = schema.validate(req.body);
      if (error) {
        res.send(Response.error(400, error));
        return; // 结束
      }
      try {
        let startIndex = (page - 1) * pagenum;
        let size = parseInt(pagenum);
        let sql = "select * from drugs where  name like ? limit ?,?";
        let result = await pool.querySync(sql, [`%${name1}%`, startIndex, size]);
        // 执行查询总条目数
        let sql2 = "select count(*) as count from drugs where name like ?";
        let result2 = await pool.querySync(sql2, [`%${name1}%`]);
        let total = result2[0].count;
        res.send(
          Response.ok({ page: parseInt(page), pagenum: size, total, result })
        );
      } catch (error) {
        res.send(Response.error(error));
      }
    
// pool.query(sql,[`%${name1}%`,page,pagenum],(err,r)=>{

//     if(err){
//         res.send(Response.error(500, error));
//         throw err;
//     }
//     res.send(Response.ok(r));
 
// })

})

// 查询药品列表
router.get('/search/drugs/list',async (req,res)=>{
    let sql="select * from drugs"
    pool.query(sql,(err,result )=>{
        if(result.length==0){
            res.send(Response.error(500, err))
        }
            res.send(Response.ok(result));
    })
})
module.exports = router;