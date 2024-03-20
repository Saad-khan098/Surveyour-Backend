import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
    name: String,
    description: [String],
    price: Number,
    currency:String,
    duration:String,
})

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema)


