import mongoose from 'mongoose';

const FormSchema = new mongoose.Schema({
    name: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true}
})
export default mongoose.models.Form || mongoose.model('Form', FormSchema)
