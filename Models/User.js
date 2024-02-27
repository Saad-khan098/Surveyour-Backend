import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    roles: [String],
    createdAt: {type: Date, default: new Date()}
})
export default mongoose.models.User || mongoose.model('User', UserSchema)
