import express from 'express';
import mongoose from 'mongoose';
import User from './Models/User.js'
import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'
import formRouter from './routes/form.js'
import elementRouter from './routes/element.js'
import responseRouter from './routes/response.js'
import checkoutRouter from './routes/checkout.js'
import plansRouter from './routes/plans.js'
import jwt from 'jsonwebtoken'
import parseJwt from './Middlewares/parseJwt.js';
import cors from "cors";

const SecretKey = 'My_Secret_Key';

const app = express();

const main = async () => {
    try {
        await mongoose.connect("mongodb+srv://musab:musab1234@cluster0.sd0hbvs.mongodb.net/?retryWrites=true&w=majority")
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
await main();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.get('/', (req,res)=>{
    res.send('hello world');
})

app.use('/auth', authRouter)

app.use(parseJwt);

app.use('/user', userRouter)
app.use('/form', formRouter)
app.use('/element', elementRouter)
app.use('/response', responseRouter)
app.use('/checkout', checkoutRouter)
app.use('/plans', plansRouter)

app.use((req, res, next) => {
    res.status(404).json({ error: 'URL Not Found' });
    next();
});

const PORT = process.env.PORT || 5600;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});