import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'

var router = express.Router();


router.post('/create', (req,res)=>{
    
    // const {order, elmentType, question, options?} = req.body;
})
router.delete('/delete/:id', (req,res)=>{
    
})


router.post('/changeOrder', async (req,res)=>{
    const {orderNumbers} = req.body;

    // [
    //     {element_id, newOrder},
    //     {element_id, newOrder},
    //     {element_id, newOrder},
    //     {element_id, newOrder},
    // ]

    orderNumbers.forEach(async elem=>{
        await Elem.updateOne({_id: elem.element_id}, {$set: {order: elem.newOrder}});
    })
})

export default router
