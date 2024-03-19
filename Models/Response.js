import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
    form: {type: mongoose.Schema.Types.ObjectId, ref:'Form', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
    createdAt: {type: Date, default: new Date()}
})

export default mongoose.models.Response || mongoose.model('Response', ResponseSchema)


