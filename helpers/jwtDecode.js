
// decode-jwt.js

const jwt = require('jsonwebtoken');

function decodeJwt(jwtToken) {
    try {
        const decodedToken = jwt.decode(jwtToken, process.env.JWT_KEY);
        return decodedToken.id; 
    } catch (error) {
        throw error; 
    }
}

module.exports = { decodeJwt };

