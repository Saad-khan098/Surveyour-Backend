import mongoose from 'mongoose';



const AnswerSchema = new mongoose.Schema({
    element: {type: mongoose.Schema.Types.ObjectId, ref: "Element", required: true},
    answer: String,
    createdAt: {type: Date, default: new Date()},
    response: {type: mongoose.Schema.Types.ObjectId, ref:'Response', required: true}
})

export default mongoose.models.Answer || mongoose.model('Answer', AnswerSchema)


