
const jwt = require('jsonwebtoken');

function decodeJwt(jwtToken) {
    try {
        const decodedToken = jwt.verify(jwtToken, process.env.JWT_KEY);
        // console.log("This is the decoded token in decode function", decodedToken);
        return decodedToken.id;
    } catch (error) {
        throw error;
    }
}

module.exports = { decodeJwt };



