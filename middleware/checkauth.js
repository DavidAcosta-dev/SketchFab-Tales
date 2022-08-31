const jwt = require('jsonwebtoken')
const { DATABASE_URL, PORT, JWT_KEY_SECRET } = require('../config')


//middleware
const checkauth = (req, res, next) => {
    try {
        const token = req.cookies.access_token

        if(!token) {
            console.log('no token found, authentication failed')
            return res.redirect('/users/login')
        }   
        
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)

            req.userId = decodedToken.userId 
            next()

    } catch(error) {
        return next(error.reason)
    }
}

module.exports = {checkauth}



























