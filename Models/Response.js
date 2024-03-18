import mongoose from 'mongoose';



const ResponseSchema = new mongoose.Schema({
    form_id: {type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
})

export default mongoose.models.Response || mongoose.model('Response', ResponseSchema)


