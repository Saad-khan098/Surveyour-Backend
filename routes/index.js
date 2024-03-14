const express = require('express');
const router = express.Router();
const SecretKey = 'My_Secret_Key';
const jwt=require("jsonwebtoken")


const authRouter= require('./auth');
const formRouter= require('./form');
const elementRouter= require('./element')
const userRouter= require('./user')

router.use('/auth',authRouter);

router.use(async(req,res,next) => {
    try{ 
    const token = req.headers.authorization;
    const user = jwt.verify(token.split(" ") [1], SecretKey);
    req.user=user;
    next()
    } catch(e){
        console.log(e);
       return res.json({msg:"TOKEN NOT FOUND/ INVALID"})
    }
})

router.use('/form',formRouter);
router.use('/element',elementRouter);
router.use('/user',userRouter);

module.exports = router;