const checkAdmin = (req,res,next)=>{
    if(req.user?.roles?.includes('admin')) next();
    else return res.status(401).json({msg: 'not an admin'}); 
}
export default checkAdmin;