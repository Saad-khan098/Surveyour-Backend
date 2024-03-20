import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import checkAdmin from '../Middlewares/checkAdmin.js';


var router = express.Router();

router.get('/', async (req,res)=>{
    console.log('get user');
    const user = await User.findOne({email: req.user.email});
    if(user) return res.json(user).end();
    else return res.status(404).json({msg: 'No user found with this email'});
})

router.delete('/:email', checkAdmin, async (req,res)=>{
    try{

        await User.deleteOne({email: req.params.email});
        res.status(204).json({msg: 'user deleted successfully'});
    }
    catch(e){
        console.log(e);
        res.status(500).json({msg: 'Some error occured'})
    }
})


export default router