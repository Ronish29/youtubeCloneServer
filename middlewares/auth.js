const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        let decode = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decode?.id
        next();

    } catch (error) {
        res.status(400).json({
            message:"Invalid token"
        })
    }
}


module.exports = auth;