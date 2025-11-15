//this middleware checks if the role of the requesting user is admin
module.exports = function (req, res, next){
    console.log("roleAdmin middleware, user role:", req.user.role);
    if(req.user.role !== 'rescue-authority'){
        return  res.status(403).json({
            message: 'Access denied, admin only'
        });
    }   
    next();
}