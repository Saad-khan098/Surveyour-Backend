import mongoose, { trusted } from 'mongoose';

const elementTypes = [
    'text', //options __ blank
    'numerical', // options __ blank
    'date',   //options __ blank
    'radio', // options __ array of strings
    'checkbox', // optins __ array of strings
    'dropdown', // optins __ array of strings
]

const ElementSchema = new mongoose.Schema({
    formId: {type: mongoose.Schema.Types.ObjectId, ref:'Form', required: true},
    order: {type: Number, required: true},
    required: {type: Boolean, default: true},
    elementType: {type: Number, required: true},
    question: {type: String, required: true},
    option: [String],
    createdAt: {type: Date, default: new Date()},
    page: {type: Number, default: 1}
})

export default mongoose.models.Element || mongoose.model('Element', ElementSchema)
