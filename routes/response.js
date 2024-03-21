import Response from "../Models/Response.js";
import Form from "../Models/Form.js";
import Answer from "../Models/Answer.js";
import Element from "../Models/Element.js";
import express from 'express';
import mongoose from "mongoose";

var router = express.Router();

router.post('/create/:formId', async (req, res) => {
    const { formId } = req.params;
    const { answers } = req.body
    try {
        const form = await Form.findOne({ _id: formId }).exec();
        console.log(form);
        if (!form) return res.status(404).send({ msg: 'form not found' });

        const response = new Response({
            form: formId,
            user: req.user?.id
        })
        await response.save();

        if (!answers) {
            return res.json({ msg: 'no answers' });
        }

        for (let answer of answers) {

            if (!answer.answer) continue;
            const ans = new Answer({
                form: formId,
                element: answer.elementId,
                elementType: answer.elementType,
                option: answer.option,
                answer: answer.answer,
                response: response._id
            })
            await ans.save();
        }


        res.json({ msg: 'response created successfully' });
    }

    catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'some error occurred' });
    }
})
router.delete('/:responseId', async (req,res)=>{
    if(!req.user)return res.status(401).json({msg: 'unauth'});
    const { responseId } = req.params;
    if(!responseId)return res.status(409).json({msg: 'invalid formId'});
    try{
        const response = await Response.findOne({_id: responseId}).populate('form').exec()
        console.log(response);
        console.log(req.user);
        if(!response)return res.status(404).json({msg: 'form not found'});
        if(response.form.user != req.user.id)return res.status(401).json({msg: 'un auth'});
        await Response.deleteOne({_id: responseId});
        await Answer.deleteMany({response: response._id})
        res.json({msg: 'response deleted successfully'})
    }
    catch(e){
        console.log(e);
        return res.status(500).json({msg: 'some error occurred'});
    }
})

router.get('/all/:formId', async (req, res) => {
    if (!req.user) return res.status(401).send({ msg: 'not auth' });
    const { formId } = req.params;

    

    try {
        const form = await Form.findOne({ _id: formId }).exec();
        if (!form) return res.status(404).send({ msg: 'form not found' });
        if (form.user != req.user.id) return res.status(401).send({ msg: 'not auth' });

        const perPage = Math.min(req.query.perPage || 3, 3);
        console.log(perPage);
        console.log()
        const page = req.query.page || 1;
        const offset = (page - 1) * perPage;

        const data = await Response.aggregate([
            {
                $match: { form: new mongoose.Types.ObjectId(formId) }
            },
            {
                $facet: {
                    total: [
                        { $count: "count" }
                    ],
                    responses: [
                        { $skip: offset },
                        { $limit: perPage }
                    ]
                }
            }
        ]);
        console.log(data);
        console.log(data[0].total)
        res.json(
            {
                pagination:
                {
                    perPage: perPage, 
                    page: page, 
                    offset: offset,
                    total: data[0].total[0]?.count || 0
                },
                responses: data[0].responses
            }
        ).end()
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'some error occurred' });
    }
})
router.get('/:responseId', async (req, res) => {

    /*
        !!! Can be Optimized !!!
    */

    if (!req.user) return res.status(401).json({ msg: 'un auth' });

    const { responseId } = req.params;

    try {
        const response = await Response.findOne({ _id: responseId }).populate('form').exec();

        if (!response) return res.status(400).json({ msg: 'response not found' });
        if (response.user != req.user.id && response.form.user != req.user.id) return res.status(401).json({ msg: 'un auth' });

        const r = await Element.aggregate([
            {
                $match:
                    { formId: response.form._id }
            },
            {
                $lookup:
                {
                    from: 'answers', // Name of the collection to join
                    localField: '_id', // Field from the 'Element' collection
                    foreignField: 'element', // Field from the 'Answer' collection
                    as: 'answer' // Output array field containing matching answers
                }
            },
            {
                $unwind: '$answer'
            },
            {
                $match:
                {
                    'answer.response': response._id
                }
            },
            {
                $project: {
                    _id: 1,
                    formId: 1,
                    elementType: 1,
                    question: 1,
                    option: 1,
                    createdAt: 1,
                    order: 1,
                    answer: '$answer.answer',
                }
            },
            { $sort: { order: 1 } }

        ])
        console.log(r);
        res.json(r);
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ msg: 'some error occurred' });
    }
})

router.get('/elementStats/:elementId', async (req, res) => {
    const { elementId } = req.params;

    if (!req.user) return res.status(401).send({ msg: 'unauth' });

    try {

        const element = await Element.findOne({ _id: elementId }).populate('formId').exec();
        if (!element) return res.status(404).json({ msg: 'element not found' });
        if (element.formId.user != req.user.id) return res.status(401).send({ msg: 'unauth' });

        const stats =
            ([4, 5, 6].includes(element.elementType)) ? await getMultipleOptionStats(element._id)
                :
                element.elementType == 1 ?
                    await getSingleOptionStats(element._id)
                    :
                    element.elementType == 2 ?
                        await getNumericalStats(element._id)
                        :
                        element.elementType == 3 ?
                            await getSingleOptionStats(element._id)
                            :
                            null
        res.json(stats);
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'some error' });
    }

})


async function getMultipleOptionStats(elementId) {
    return await Answer.aggregate([
        {
            $match: {
                element: elementId
            }
        },
        {
            $group: {
                _id: '$answer',
                count: { $sum: 1 }
            }
        }
    ])
}
async function getSingleOptionStats(elementId) {
    const totalAnswers = await Answer.countDocuments({ element: elementId }).exec();
    return { totalSubmission: totalAnswers };
}
async function getNumericalStats(elementId) {
    return await Answer.aggregate([
        {
            $match: {
                element: elementId
            },

        },
        {
            $group: {
                _id: null,
                totalSubmissions: { $sum: 1 },
                totalAnswers: { $sum: { $toInt: '$answer' } }
            }
        },
        {
            $project: {
                totalSubmissions: 1,
                totalAnswers: 1
            }
        }
    ])
}
export default router
