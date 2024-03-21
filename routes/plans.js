import express from 'express';
import stripePackage from 'stripe';

const stripe = stripePackage('sk_test_51OwB35P6rBN9TIIzalKT0Y1oaiTXhbdC1x1AE7gYT8SMFbOaGPaER5VfF7gwK7X1ItnxXZpcFYVBj9dXciYiDnPq00G1e3yn5Z');

var router = express.Router();

router.get('/', async (req,res)=>{
    try {
        const products = await stripe.prices.list();
        if(!products)return res.status(404).json({msg: 'not found'});
        const data = products.data.map(elem=>{
            return {
                priceId: elem.id,
                currency: elem.currency,
                interval: elem.recurring.interval,
                priceInCents: elem.unit_amount
            }
        })
        return res.json(data);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'An error occurred while fetching products' });
    }
})

export default router