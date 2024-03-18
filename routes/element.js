import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'
import Element from '../Models/Element.js'

var router = express.Router();


router.post('/createE', async(req,res)=>{
    try{
        const {formId, order, elementType, question, option} = req.body;
        // 

        // const user = await User.findOne({email: req.user.email})
        // if (!user) return res.status(404).json({msg:'USER NOT FOUND'})

        const form = await Form.findById(formId);
        if (!form) return res.status(404).json({ msg: "Form not found" });

        await Element.create({...req.body, user:req.user.id})
        res.status(200).json({ msg: "ELEMENT CREATED" })

    }catch(error){
        console.error(error);
        res.status(500).json({msg: 'some error occured'});
    }
})

router.delete('/delete/:id', async(req,res)=>{
    try{
        const element = await Element.findOne({_id: req.params.id})
        if (!element) return res.status(404).json({msg:"ELEMENT NOT FOUND"})
        
        await Element.deleteOne({_id: req.params.id})
        res.status(200).json({msg:"ELEMENT DELETED"})

    }catch(error){ 
    console.error(error);
    res.status(500).json({msg: 'some error occured'});
    }
})


router.post('/changeOrder', async (req, res) => {
    try {
        const { orderNumbers } = req.body;
        for (const element of orderNumbers) {
            await Element.updateOne(
                { _id: element.element_id },
                { $set: { order: element.newOrder } }
            );
        }
        res.status(200).json({ msg: 'Order updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Some error occurred' });
    }
});

// router.post('/changeOrder', async (req,res)=>{
//     try{ 
//         const {orderNumbers} = req.body;
//         orderNumbers.forEach(async element => {
//         await Element.updateOne({_id: element.element_id}, {$set: {order: element.newOrder}});
//         })
//     }catch(error){
//     console.error(error);
//     res.status(500).json({msg: 'some error occured'});
//     }
// })

export default router

// [
    //     {element_id, newOrder},
    //     {element_id, newOrder},
    //     {element_id, newOrder},
    //     {element_id, newOrder},
    // ]