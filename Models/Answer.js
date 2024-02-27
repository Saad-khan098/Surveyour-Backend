import mongoose from 'mongoose';



const AnswerSchema = new mongoose.Schema({
    form_id: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    element_id: {type: mongoose.Schema.Types.ObjectId, red: "Element", required: true},
    elementType: {type: Number, required: true},
    option: [String],
    answer: String,
    createdAt: {type: Date, default: new Date()}
})

export default mongoose.models.Answer || mongoose.model('Answer', AnswerSchema)
