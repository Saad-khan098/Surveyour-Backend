import mongoose from 'mongoose';

const FormSchema = new mongoose.Schema({
    name: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    pages: {type: Number, default: 1},
    createdAt: {type: Date, default : new Date()},
    public: {type: Boolean, default: false}
})
export default mongoose.models.Form || mongoose.model('Form', FormSchema)
