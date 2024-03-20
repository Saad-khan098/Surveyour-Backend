import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'
import Element from '../Models/Element.js'
import mongoose from 'mongoose';

var router = express.Router();

router.get('/all', async (req, res) => {

    if (!req.user) return res.status(401).json({ msg: 'not auth' });

    const perPage = Math.min(req.query.perPage || 3, 3);    
    const page = req.query.page || 1;
    const offset = (page - 1) * perPage;

    console.log(req.user.id);

    const data = await Form.aggregate([
        {
            $match: { user: new mongoose.Types.ObjectId(req.user.id) }
        },
        {
            $facet: {
                total: [
                    { $count: "count" }
                ],
                forms: [
                    { $skip: offset },
                    { $limit: perPage }
                ]
            }
        }
    ]);
    res.json(
        {
            pagination:
            {
                perPage: perPage,
                page:page, 
                offset: offset, 
                total: data[0].total[0]?.count || 0
            }, 
            forms: data[0].forms
        }).end()
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);

        const formWithElements = await Form.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'elements',
                    localField: '_id',
                    foreignField: 'formId',
                    as: 'elements'
                }
            }
        ]);
        if (!formWithElements || formWithElements.length === 0) {
            return res.json({ msg: 'FORM NOT FOUND' });
        }

        res.json(formWithElements[0]).end();
    } catch (e) {
        console.log(e);
        res.json({ msg: 'Some error occurred' }).end();
    }
});



// router.get('/:id', async (req,res)=>{
//     try{
//         const {id} = req.params;
//         const form = await Form.findOne({_id: id});
//         if (!form) return res.json({msg:"FORM NOT FOUND"});

//         const elements = await Element.find({formId: id});
//         form.elements = elements;
//         res.json(form).end();
//     }
//     catch(e){
//         console.log(e);
//         res.json({msg: 'some error occured'}).end();
//     }  
// })


router.put('/:id', async (req, res) => {


    const { name } = req.body;
    const { id } = req.params;

    if (!req.user) {
        return res.status(401).json({ msg: 'not authorized' });
    }

    if (!name || name.length == 0) {
        res.status(400).json({ msg: "enter valid form name" });
    }
    try {
        const form = await Form.findById(id);
        if (!form) {
            return res.status(404).json({ msg: "Form not found" });
        }

        if (String(form.user) !== String(req.user.id)) {
            return res.status(401).json({ msg: "Unauthorized" });
        }
        await Form.findByIdAndUpdate(id, { name: name });
        res.status(204).json({ msg: 'form updated sucessfullly' })
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'some error occured' });
    }
})

router.post('/create', async (req, res) => {
    const { name } = req.body;

    if (!req.user) {
        return res.status(401).json({ msg: 'not auth' });
    }
    if (!req.user.roles.includes('premium')) {
        const formsCount = await Form.countDocuments({ user: req.user.id }).exec()
        console.log(formsCount);
        if (formsCount >= 5) return res.status(403).json({ msg: 'limit exceeded. You can only create upto 5 forms for free' });
    }
    try {
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ msg: "Please enter a valid form name" });
        }
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Unauthorized, please login" });
        }
        const form = await Form.findOne({ name: name, user: req.user.id }).exec();
        if (form) return res.status(409).send({ msg: 'a form by this name already exists' })

        await Form.create({
            name: name,
            user: req.user.id
        });
        return res.status(201).json({ msg: 'Form created successfully' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ msg: 'Some error has occurred' });
    }
});

router.delete('/:id', async (req, res) => {

    if (!req.user) return res.status(401).send({ msg: 'not auth' });

    const { id } = req.params;
    const form = await Form.findOne({ _id: id }).exec();

    if (!form) {
        return res.status(404).send({ msg: 'form not found' });
    }
    if (form.user != req.user.id) return res.status(401).send({ msg: 'not auth' });

    await Form.deleteOne({ _id: form._id }).exec();
    await Element.deleteMany({ formId: form.id }).exec();

    res.json({ msg: `form ${form._id} and all of its elements deleted successfully` })
})

export default router
