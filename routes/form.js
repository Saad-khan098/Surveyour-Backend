import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import Form from '../Models/Form.js'

var router = express.Router();

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Use aggregation to fetch form and elements with the same formId
        const formWithElements = await Form.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(id) } }, // Match the specified formId
            {
                $lookup: {
                    from: 'elements', // Collection name for elements
                    localField: '_id',
                    foreignField: 'formId',
                    as: 'elements' // Store elements in the form document
                }
            }
        ]);

        if (!formWithElements || formWithElements.length === 0) {
            return res.json({ msg: 'FORM NOT FOUND' });
        }

        res.json(formWithElements[0]).end(); // Return the first (and only) matched form document
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

router.post('/create', async (req, res) => {
    const { name } = req.body;

    try {
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ msg: "Please enter a valid form name" });
        }
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: "Unauthorized, please login" });
        }
        const user = await User.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        await Form.create({
            name: name,
            user: user._id
        });
        return res.status(201).json({ msg: 'Form created successfully' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ msg: 'Some error has occurred' });
    }
});

export default router
