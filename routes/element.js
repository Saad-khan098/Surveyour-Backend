import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'
import Element from '../Models/Element.js'
import Answer from '../Models/Answer.js';

var router = express.Router();



const elementTypes = [
    {
        name: 'text',
    },
    {
        name: 'numerical'
    },
    {
        name: 'date',
    }
    ,
    {
        name: 'radio'
    },
    {
        name: 'checkbox'
    },
    {
        name: 'dropdown'
    }
]


router.get('/elementTypes', async (req,res)=>{
   return res.json(elementTypes).end();
})
router.post('/create', async(req,res)=>{
    if(!req.user){
        return res.status(401).json({msg: 'not authorized'});
    }
    try{
        const {formId, order, elementType, question, option, page} = req.body;
        console.log(req.body)
       

        const form = await Form.findById(formId);
        if (!form) return res.status(404).json({ msg: "Form not found" });
        if(form.user != req.user.id)return res.status(401).json({msg: 'not authorized'});

        await Element.create({...req.body, user:req.user.id})
        res.status(200).json({ msg: "ELEMENT CREATED" })

    }catch(error){
        console.error(error);
        res.status(500).json({msg: 'some error occured'});
    }
})

router.post('/changeOrder', async (req, res) => {
 
    // NO CHECK ADDED YET !!! NOT SECURE

    if(!req.user)return res.status(401).json({msg: 'not auth'});

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


/*
MIDDLEWARE TO CHECK IF ELEMENT BELONGS TO USER
BELOW ARE ALL ENDPOINTS ONLY ACCESSIBLE TO OWNER OF ELEMENT WITH ELEMENT_ID: elementId(param)
*/

router.use('/:func/:elementId', async (req,res,next)=>{
    const {elementId} = req.params;
    if(!elementId)return res.status(409).json({ msg: 'no elementId sent' })
    if(!req.user)return res.status(401).json({msg: 'not auth'});
    try{
        const element = await Element.findOne({_id: elementId}, {formId: 1}).populate('formId').exec()
        if (!element) return res.status(404).json({msg:"ELEMENT NOT FOUND"})
        if(element.formId.user != req.user.id)return res.status(409).json({msg: 'not aut'});
        req.element = element;
    }
    catch(e){
        console.log(e)
        return res.status(500).json({msg: 'some error occured'});
    }
    next()
})

router.delete('/delete/:elementId', async(req,res)=>{
    const {elementId} = req.params;
    try{
        await Element.deleteOne({_id: elementId})
        await Answer.deleteMany({element: elementId});
        res.status(200).json({msg:"ELEMENT DELETED"})
    }
    catch(error){ 
    console.error(error);
    res.status(500).json({msg: 'some error occured'});
    }
})

router.post('/changeQuestion/:elementId', async (req,res)=>{

    const {elementId} = req.params;
    const {question} = req.body;    

    if(!question) return res.status(400).json({msg: 'incoorect question'})

    try{        
        await Element.updateOne({_id: elementId}, {$set: {question: question}}).exec()
        res.json({msg: `element question ${elementId} successfully updated `});
    }
    catch(e){
        console.log(e);
        res.status(500).json({ msg: 'Some error occurred' });
    }
    
})
router.post('/addOption/:elementId', async (req,res)=>{

    const {elementId} = req.params;
    const {option} = req.body;
    if(!option) return res.status(400).json({msg: 'incoorect option'})

    try{        
        await Element.updateOne({_id: elementId}, {$push: {option: option}}).exec();
        return res.json({msg: 'option added'}).end();
    }
    catch(e){
        console.log(e);
        res.status(500).json({ msg: 'Some error occurred' });
    }
 
})

router.post('/removeOption/:elementId', async (req,res)=>{

    const {elementId} = req.params;
    const {option} = req.body;   
    if(!option) return res.status(400).json({msg: 'incoorect option'})

    try{        
        await Element.updateOne({_id: elementId}, {$pull: {option: option}}).exec();
        return res.json({msg: 'option removed'}).end();
    }
    catch(e){
        console.log(e);
        res.status(500).json({ msg: 'Some error occurred' });
    }
})
router.post('/changePage/:elementId', async (req,res)=>{
    const {elementId} = req.params;
    const {page} = req.body;
    if(!page) return res.status(400).json({msg: 'incoorect page given'});
    try{
        await Element.updateOne({_id: elementId}, {$set: {page: page}}).exec();
        return res.json({msg: 'page changed'}).end();
    }
    catch(e){
        console.log(e);
        res.status(500).json({ msg: 'Some error occurred' });
    }
})
export default router
