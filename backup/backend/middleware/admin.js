let Admin = (req, res, next) => {
    if(req.jwtData.role_id == 1) {
        next()
    }else{
        res.status(500).json({
            "log" : "You Are Not Super Admin!!!!"
        })
    }
}
export default Admin;