import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'
import Element from '../Models/Element.js'

var router = express.Router();


router.get('/:id', async (req,res)=>{
    try{
        const {id} = req.params;
        const form = await Form.findOne({_id: id});
        if (!form) return res.json({msg:"FORM NOT FOUND"});
        // 
        const elements =  await Element.findOne({formId: form._id}).exec();
        form.elements = elements;
        // 
        res.json({msg: "FORM FOUND", form}).end();
    }
    catch(e){
        console.log(e);
        res.json({msg: 'some error occured'}).end();
    }  
})


router.put('/:id', async (req,res)=>{

    console.log(req.user)

    const {name} = req.body;
    const {id} = req.params;
    if(!name || name.length ==0){
        res.status(400).json({msg: "enter valid form name"});
    }
    try{
        const form = await Form.findById(id);
        if (!form) {
            return res.status(404).json({ msg: "Form not found" });
        }

        if (String(form.user) !== String(req.user._id)) {
            return res.status(401).json({ msg: "Unauthorized" });
        }
        await Form.findByIdAndUpdate(id, { name: name });
        res.status(204).json({msg: 'form updated sucessfullly'})
    }
    catch(e){
        console.log(e);
        res.status(500).json({msg: 'some error occured'});
    }
})

router.post('/create', async (req,res)=>{
    const {name} = req.body;
    if(!name || name.length ==0){
        res.status(400).json({msg: "enter valid form name"});
    }
    try{
        const user = await User.findOne({email : req.user.email})
        if (!user) return res.status(401).json({msg:"USER NOT FOUND"});
        
        await Form.create({
            name: name,
            user: req.user? req.user.id: null
        })
        res.status(201).json({msg: 'form created successfully'});
    }
    catch(e){
        console.log(e);
        res.status(500).json({msg: 'some error occured'});
    }
})

export default router
