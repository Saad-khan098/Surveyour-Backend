import express from 'express';
import stripePackage from 'stripe';
import Subscription from '../Models/Subscription.js'
import User from '../Models/User.js';

const stripe = stripePackage('sk_test_51OwB35P6rBN9TIIzalKT0Y1oaiTXhbdC1x1AE7gYT8SMFbOaGPaER5VfF7gwK7X1ItnxXZpcFYVBj9dXciYiDnPq00G1e3yn5Z');

var router = express.Router();

router.post('/createSession', async (req, res) => {

    if(!req.user)return res.status(401).json({msg: 'unauth'});

    const {planId} = req.body

    console.log(planId);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                   price: planId,
                    quantity: 1
                }
            ],
            mode: 'subscription',
            customer_email: req.user.email,
            success_url: `http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'http://localhost:3000/checkout/cancel',
            metadata: {
                userId: req.user.id
            }
        });
        res.json({redirect: session.url});
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'An error occurred while creating checkout session' });
    }
});
router.get('/success', async (req, res) => {
    const sessionId = req.query.session_id;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const userId = session.metadata.userId;

        console.log("User ID:", userId);
        const user = await User.updateOne({_id: userId},{ $push: {roles: 'premium'}})        
        res.json({ msg: 'Payment successful. You hace now been promoted to premium' });
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).json({ error: 'An error occurred while processing payment' });
    }
});


router.get('/cancel', async (req, res) => {
    res.json({ msg: 'Some error. Unable to proceed' });
});




// const endpointSecret = "whsec_cd339ac1fa7bc53101dd7578bafaee191b8f65624942dd8990831fff6d1cb12e";
// router.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
//     console.log('webhook triggered');
//   const sig = request.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//   } catch (err) {
//     response.status(400).send(`Webhook Error: ${err.message}`);
//     return;
//   }

//   // Handle the event
//   console.log(`Unhandled event type ${event.type}`);

//   // Return a 200 response to acknowledge receipt of the event
//   response.send();
// });
export default router