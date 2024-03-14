import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';

const SecretKey = 'My_Secret_Key';

var router = express.Router();


// Email validation function
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation function
function validatePassword(password) {
    return password.length >= 8;
}


router.post("/signUp", async (req, res) => {
    try {
        console.log('signup')
        console.log(req.body)
        const { email, password } = req.body

        if(!validateEmail(email)){
            return res.status(400).json({msg: 'Invalid Email'})
        }
        if(!validatePassword(password)){
            return res.status(400).json({msg: 'Invalid Password'})
        }

        let user = await User.findOne({ email })
        if (user) return res.status(409).json({ msg: "this user already exists" })

        await User.create({ email: email, password: await bcrypt.hash(password, 10) });
        return res.status(201).json({msg: 'User created successfully'})



    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ msg: "USER NOT FOUND" })

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) return res.json({ msg: "WRONG PASSWORD" })

        const token = jwt.sign({
            id: user._id,
            email,
            createdAt: new Date(),
            roles: user.roles
        }, SecretKey, { expiresIn: "1d" });

        res.json({
            msg: "LOGGED IN", token
        })
    } catch (error) {
        console.error(error)
    }
});

export default router