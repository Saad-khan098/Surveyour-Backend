import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'
import Element from '../Models/Element.js'

var router = express.Router();


router.post('/create', async(req,res)=>{
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
        const element = await Element.findOne({id: req.params.id})
        if (!element) return res.status(404).json({msg:"ELEMENT NOT FOUND"})
        
        await Element.deleteOne({_id: req.params.id})
        res.status(204).json({msg:"ELEMENT DELETED"})

    }catch(error){ 
    console.error(error);
    res.status(500).json({msg: 'some error occured'});
    }
})

// const elements = await Element.find({formId: form._id});
// form.elements = elements;


router.post('/changeOrder', async (req,res)=>{
    const {orderNumbers, formId} = req.body;

    // [
    //     {element_id, newOrder},
    //     {element_id, newOrder},
    //     {element_id, newOrder},
    //     {element_id, newOrder},
    // ]

    orderNumbers.forEach(async elem=>{
        await Elem.updateOne({_id: elem.element_id, formId: formId}, {$set: {order: elem.newOrder}});
    })
})

export default router
