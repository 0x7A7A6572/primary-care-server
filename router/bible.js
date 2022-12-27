const express = require('express');
const router = express.Router();
const Joi = require('joi');
const pool = require('../utils/db.js');
const Response = require('../utils/Response.js');

//医疗宝典疾病列表
router.get('/bible/query', (req, res) => {
    //执行查询业务
    let sql = "select * from subject";
    pool.query(sql, (error, value) => {
        if(error){
            res.send(Response.error(500, error))
            // throw error;
        }
        if(value && value.length == 0){
            //没查到
            res.send(Response.ok(null))
        }else{
            res.send(Response.ok(value));
        }
    })
})

router.post('/bible/queryFid',(req,res)=>{
    let {id} = req.body;
    //表单验证
    let schema = Joi.object({
        id:Joi.string().required(),//必填
    });
    let {error,value} = schema.validate(req.body);
    if(error){
        res.send(Response.error(500, error))
        return; //结束
    }

    //执行查询任务
    let sql = "select * from disease where sid=?"
    pool.query(sql,[id],(error,value)=> {
        if(error){
            res.send(Response.error(500, error))
            // throw error;
        }
        res.send(Response.ok(value));  
    })

})

module.exports = router;