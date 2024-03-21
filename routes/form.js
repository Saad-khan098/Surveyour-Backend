import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'
import Element from '../Models/Element.js'
import mongoose from 'mongoose';
import Response from '../Models/Response.js';

var router = express.Router();

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
                page: page,
                offset: offset,
                total: data[0].total[0]?.count || 0
            },
            forms: data[0].forms
        }).end()
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const page = req.query.page || 1;

        const form = await Form.findOne({ _id: id }).exec();
        if (!form) return res.status(404).json('form not found')
        if (!form.public && form.user != req.user?.id) {
            return res.status(401).json({ msg: 'this form has not been made public yet' });
        }
        const elements = await Element.find({ formId: form._id, page: page }).exec();

        if (elements.length === 0) {
            return res.json({ msg: 'No elements on this page' });
        }

        return res.json({ form: form, elements: elements });
    } catch (e) {
        console.log(e);
        res.json({ msg: 'Some error occurred ' }).end();
    }
});


/*
MIDDLEWARE TO CHECK IF FORM BELONGS TO USER
BELOW ARE ALL ENDPOINTS ONLY ACCESSIBLE TO OWNER OF FORM WITH FORM_ID: id(param)
*/


router.use('/:func/:id',async (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: 'not authorized' });
    const { id } = req.params;
    if (!id) return res.status(409).json({ msg: 'no formId sent' })

    try{
        const form = await Form.findOne({ _id: id }).exec();
        if (!form) return res.status(404).json('form not found')
        if (form.user != req.user.id)
            return res.status(401).json({ msg: 'un auth' });   
        req.form = form;
    }
    catch(e){
        res.status(500).json({ msg: 'Some error occurred during form owner check' }).end();
    }
    next(); 
})



router.get('/submit/:id', async (req, res) => {
    const {id} = req.params    
    try {
        await Form.updateOne({ _id: id }, { $set: { public: true } });
        res.json({ formId: id });
    } catch (e) {
        console.log(e);
        res.json({ msg: 'Some error occurred' }).end();
    }
});

router.put('/changeName/:id', async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    
    if (!name || name.length == 0) {
        return res.status(400).json({ msg: "enter valid form name" });
    }
    try {
        await Form.findByIdAndUpdate(id, { name: name });
        return res.json({ msg: 'form updated sucessfullly' })
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ msg: 'some error occured' });
    }
})


router.get('/addPage/:id', async (req, res) => {
    const {id} = req.params;
    try{
        await Form.updateOne({_id: id},{$inc:{pages: 1}})
        res.json({msg: 'page added'});
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'some error' });
    }
})
router.get('/deletePage/:id', async (req, res) => {
    const {id} = req.params;
    const {page} = req.query;
    if(!page)return res.status(409).json({msg: 'page number not given'});
    try{
        await Form.updateOne({_id: id},{$inc:{pages: -1}})
        await Element.deleteMany({formId: id, page: page});
        res.json({msg: 'page deleted with all of its elements'});
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'some error' });
    }
})

router.delete('/deleteForm/:id', async (req, res) => {
    // SHIFT LEFT AFTER PAGE DELETION
    const { id } = req.params;
    try{

        await Form.deleteOne({ _id: id }).exec();
        await Element.deleteMany({ formId: id }).exec();
        await Response.deleteMany({form: id}).exec();
        res.json({ msg: `form ${id} and all of its elements deleted successfully` })
    }
    catch(e){
        console.log(e);
        res.status(500).json({ msg: 'some error' });
    }
})

export default router
