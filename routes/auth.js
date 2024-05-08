import bcrypt from 'bcrypt';
import User from "../Models/User.js";
import express from 'express';
import jwt from 'jsonwebtoken';
import { transporter, generatePassword } from "../utils/helpers.js"
import parseJwt from '../Middlewares/parseJwt.js';

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
        const { name, email, password } = req.body

        if(!validateEmail(email)){
            return res.status(400).json({msg: 'Invalid Email'})
        }
        if(!validatePassword(password)){
            return res.status(400).json({msg: 'Invalid Password'})
        }

        let user = await User.findOne({ email })
        if (user) return res.status(409).json({ msg: "this user already exists" })

        await User.create({ email: email, password: await bcrypt.hash(password, 10), name: name });
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
        if (!passwordCheck) return res.status(401).json({ msg: "WRONG PASSWORD" })

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

router.use(parseJwt)

router.post("/forgetPassword", async (req,res) => {
    try{
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }
        else { 
            const newPassword = generatePassword();
            await user.updateOne({ password: await bcrypt.hash(newPassword, 5) })
            await transporter.sendMail({
                from: 'musabgym20@gmail.com',
                to: user.email,
           
            subject: "Surveyour Password Reset",
                text: `Dear ${user.name}, your new password is: ${newPassword}`
            });
        }
        return res.status(200).json({ msg: 'New Password sent to your Email' });

    }catch(error){
        console.error(error)
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
})

    router.post("/changePassword", async (req, res) => {
        try {
            const { oldPassword, newPassword, confirmNewPassword } = req.body

            const user = await User.findOne({ email: req.user.email });
            if (!user) {
            return res.status(400).json({ msg: "User not found" });}

            const passwordCheck = await bcrypt.compare(oldPassword, user.password);
            if (!passwordCheck) return res.status(400).json({ msg: "WRONG PASSWORD" })

            if (newPassword !== confirmNewPassword) 
            return res.status(400).json({ msg: 'Did not confirm password correctly' });

            if (user) await user.updateOne({ password: await bcrypt.hash(newPassword, 5) })
            return res.status(200).json({ msg: 'Password Changed Successfully' });

        } catch (error) {
            console.error(error)
            return res.status(500).json({ msg: 'Internal Server Error' });
        }
    })

export default router