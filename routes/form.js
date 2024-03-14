import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'

var router = express.Router();


router.get('/:id', async (req,res)=>{
    console.log(req.user);
    const {id} = req.params;
    try{
        const form = await Form.findOne({_id: id});
        const elements = await Element.find({formId: form._id});
        form.elements = elements;
        res.json(form).end();
    }
    catch(e){
        console.log('some error');
        res.json({msg: 'some error occured'})
    }

    
})


router.put('/:id', async (req,res)=>{

    console.log(req.user)

    const {name} = req.body;
    if(!name || name.length ==0){
        res.status(404).json({msg: "enter valid form name"});
    }

    // check user matches with form -> user_id

    const {id} = req.params;
    try{
        await Form.updateOne(
            {_id: id},
            {$set: {name: name}}
        )
        res.json({msg: 'form updated sucessfullly'})
    }
    catch(e){
        console.log('some error');
        res.json({msg: 'some error occured'})
    }
})

router.post('/create', async (req,res)=>{

    if(!req.user)res.status(401).json({msg: 'login required'});
    const {name} = req.body;


    if(!name || name.length == 0){
        res.status(404).json({msg: "enter valid form name"});
    }

    try{
        console.log(req.body);
        
        const form = new Form({
            name: name,
            user: req.user? req.user.id: null
        })
        console.log(form);
        await form.save();
        res.json({msg: 'form created successfully'});
    }
    catch(e){
        console.log(e);
        res.json({msg: 'some error occured'});
    }
})

export default router
