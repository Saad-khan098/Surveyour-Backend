import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'
import Element from '../Models/Element.js'

var router = express.Router();


router.post('/create', async(req,res)=>{
    if(!req.user){
        return res.status(401).json({msg: 'not authorized'});
    }
    try{
        const {formId, order, elementType, question, option} = req.body;
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

router.delete('/:id', async(req,res)=>{
    const {id} = req.params;

    if(!req.user)return res.status(401).json({msg: 'not auth'});
    
    try{
        const element = await Element.findOne({_id: id}, {formId: 1}).populate('formId').exec()
        console.log(element);

        if (!element) return res.status(404).json({msg:"ELEMENT NOT FOUND"})

        if(element.formId.user != req.user.id)return res.status(409).json({msg: 'not aut'});

        
        await Element.deleteOne({_id: id})
        res.status(200).json({msg:"ELEMENT DELETED"})

    }catch(error){ 
    console.error(error);
    res.status(500).json({msg: 'some error occured'});
    }
})


router.post('/changeOrder', async (req, res) => {

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
router.post('/changeQuestion/:elementId', async (req,res)=>{
    if(!req.user)return res.status(401).json({msg: 'not auth'});

    const {elementId} = req.params;
    const {question} = req.body;    

    if(!question || question.length < 2) return res.status(400).json({msg: 'incoorect question'})

    try{
        const element = await Element.findOne({_id: elementId}, {formId: 1}).populate('formId').exec()
        if(!element)return res.status(404).json({msg: 'element not found'});
        if(element.formId.user != req.user.id)return res.status(401).json({msg: 'not auth'});
        
        await Element.updateOne({_id: elementId}, {$set: {question: question}}).exec()
        res.json({msg: `element question ${elementId} successfully updated `});
    }
    catch(e){
        console.log(e);
        res.status(500).json({ msg: 'Some error occurred' });
    }
    
})
router.post('/addOption/:elementId', async (req,res)=>{
    if(!req.user)return res.status(401).json({msg: 'not auth'});

    const {elementId} = req.params;
    const {option} = req.body;   
    if(!option || option.length <= 0) return res.status(400).json({msg: 'incoorect option'})


    try{
        const element = await Element.findOne({_id: elementId}, {formId: 1}).populate('formId').exec()
        if(!element)return res.status(404).json({msg: 'element not found'});
        if(element.formId.user != req.user.id)return res.status(401).json({msg: 'not auth'});
        
        await Element.updateOne({_id: elementId}, {$push: {option: option}}).exec();
        return res.json({msg: 'option added'}).end();
    }
    catch(e){
        console.log(e);
        res.status(500).json({ msg: 'Some error occurred' });
    }
 
})

router.post('/removeOption/:elementId', async (req,res)=>{
    if(!req.user)return res.status(401).json({msg: 'not auth'});

    const {elementId} = req.params;
    const {option} = req.body;   
    if(!option || option.length <= 0) return res.status(400).json({msg: 'incoorect option'})

    try{
        const element = await Element.findOne({_id: elementId}, {formId: 1}).populate('formId').exec()
        if(!element)return res.status(404).json({msg: 'element not found'});
        if(element.formId.user != req.user.id)return res.status(401).json({msg: 'not auth'});
        
        await Element.updateOne({_id: elementId}, {$pull: {option: option}}).exec();
        return res.json({msg: 'option removed'}).end();
    }
    catch(e){
        console.log(e);
        res.status(500).json({ msg: 'Some error occurred' });
    }
 
})

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
