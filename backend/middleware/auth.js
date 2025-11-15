const jwt = require('jsonwebtoken');

module.exports = function (req, res, next){
    const header = req.headers.authorization;
    if(!header || !header.startsWith('Bearer ')){
        return res.status(401).json({
            message: 'No token found, authorization denied!'
        });
    }

    const token = header.split(' ')[1];
    try{
        //authenticates the token and gives access to data inside it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        //attaching id to the req user so it can be given access to the next function
        req.user = {id: decoded.id,
            role: decoded.role
        };
        //moving on to the route handler after this middleware
        next();
    }
    catch(err){
        return res.status(401).json({
            message: 'Token not valid'
        });
    }
};