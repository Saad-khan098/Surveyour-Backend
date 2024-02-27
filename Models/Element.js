import mongoose from 'mongoose';

const elementTypes = [
    text, //options __ blank
    numerical, // options __ blank
    radio, // options __ array of strings
    checkbox, // optins __ array of strings
    dropdown, // optins __ array of strings
    date,   //options __ blank
]

const ElementSchema = new mongoose.Schema({
    formId: {type: mongoose.Schema.Types.ObjectId, ref:'Form', required: true},
    order: {type: Number, required: true},
    elementType: {type: Number, required: true},
    question: {type: String, required: true},
    option: [String],
    createdAt: {type: Date, default: new Date()}
})

export default mongoose.models.Element || mongoose.model('Element', ElementSchema)
