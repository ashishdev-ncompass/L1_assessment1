const jwt = require('jsonwebtoken');
const config = require("../Config/config.json")

const tokenCreator = (email) => {

    let jwtSecretKey = config.JWT_SECRET_KEY;
    let data = {
        email: email,
    }
    return jwt.sign(data, jwtSecretKey, { expiresIn: "30m" });
}

module.exports = {
    tokenCreator
}