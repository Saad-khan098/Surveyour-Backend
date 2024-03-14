import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'

var router = express.Router();


router.get('/:id', async (req,res)=>{
<<<<<<< HEAD
    console.log(req.user);
    const {id} = req.params;
=======
>>>>>>> b368100f6ca33eb4224e03b76ca5abd71c2a7e12
    try{
        const {id} = req.params;
        const form = await Form.findOne({_id: id});
<<<<<<< HEAD
        const elements = await Element.find({formId: form._id});
        form.elements = elements;
        res.json(form).end();
    }
    catch(e){
        console.log('some error');
        res.json({msg: 'some error occured'})
    }

    
=======
        if (!form) return res.json({msg:"FORM NOT FOUND"});
        res.json({msg: "FORM FOUND", form}).end();
    }
    catch(e){
        console.log(e);
        res.json({msg: 'some error occured'}).end();
    }  
>>>>>>> b368100f6ca33eb4224e03b76ca5abd71c2a7e12
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
<<<<<<< HEAD
        console.log('some error');
        res.json({msg: 'some error occured'})
=======
        console.log(e);
        res.status(500).json({msg: 'some error occured'});
>>>>>>> b368100f6ca33eb4224e03b76ca5abd71c2a7e12
    }
})

router.post('/create', async (req,res)=>{
<<<<<<< HEAD

    if(!req.user)res.status(401).json({msg: 'login required'});
    const {name} = req.body;


    if(!name || name.length == 0){
        res.status(404).json({msg: "enter valid form name"});
=======
    const {name} = req.body;
    if(!name || name.length ==0){
        res.status(400).json({msg: "enter valid form name"});
>>>>>>> b368100f6ca33eb4224e03b76ca5abd71c2a7e12
    }
    try{
        const user = await User.findOne({email : req.user.email})
        if (!user) return res.status(401).json({msg:"USER NOT FOUND"});
        
        await Form.create({
            name: name,
            user: req.user? req.user.id: null
        })
<<<<<<< HEAD
        console.log(form);
        await form.save();
        res.json({msg: 'form created successfully'});
    }
    catch(e){
        console.log(e);
        res.json({msg: 'some error occured'});
=======
        res.status(201).json({msg: 'form created successfully'});
    }
    catch(e){
        console.log(e);
        res.status(500).json({msg: 'some error occured'});
>>>>>>> b368100f6ca33eb4224e03b76ca5abd71c2a7e12
    }
})

export default router
