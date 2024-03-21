import jwt from 'jsonwebtoken'
const SecretKey = 'My_Secret_Key';

const parseJwt = function (req,res,next){
    try {
        const token = req.headers.authorization;
        const user = jwt.verify(token.split(" ")[1], SecretKey)
        req.user = user;
        next()
    } catch (e) {
        req.user = null
        next()
        // return res.json({ msg: "TOKEN NOT FOUND / INVALID" })
    }
}
export default parseJwt;