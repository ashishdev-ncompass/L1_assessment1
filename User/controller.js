const { executeQuery } = require("../Utilities/db");
const { makeResponse } = require("../Utilities/responseMaker");
const { encryptData } = require("../Utilities/encryptor");
const { tokenCreator } = require("./createToken");
const { errorObjectCreator } = require("../Utilities/errorHandler");
const jwt = require('jsonwebtoken');

// Default error code is set to 500 and it is changed whenever needed.
var errorCode = 500;

const userLogin = async (req, res, next) => {
    try {
        let data = req.body;
        let email = data.email;
        const inputData = [data.email];

        // encrypting the user entered password
        encryptedPassword = encryptData(data.password);
        query = `select password from user where email = ?`;

        result = await executeQuery(query, inputData).catch(function reject(error) {
            throw error;
        });

        if (Object.keys(result).length == 0) {
            errorCode = 404;
            throw new Error("email not valid");
        } else {
            if (result[0].password == encryptedPassword) {
                const token = tokenCreator(email);
                return res.json(makeResponse(`login successfull !!! token = ${token}`));
            } else {
                errorCode = 406;
                throw new Error("wrong password !!!");
            }
        }
    } catch (error) {
        let errorObject = errorObjectCreator(
            "error while user login",
            errorCode,
            error
        );
        next(errorObject);
    }
};


const getUser = (token) => {
    var decode = jwt.decode(token);
    return decode.email;
}

const checkUser = async (email) => {
        const inputData = [email];
        let query = `select * from user where email = ?`;
        let result = await executeQuery(query, inputData).catch(function reject(error) {
            throw error;
        });

        // checking if object result is empty or not
        if (Object.keys(result).length == 0) {
            return false;
        } else {
            return true;
        }
}

const getUserId = async (token) => {
    var decode = jwt.decode(token);
    const inputData = [decode.email];
    let query = `select id from user where email = ?`;
    let result = await executeQuery(query, inputData).catch(function reject(error) {
        throw error;
    });

    // checking if object result is empty or not
    return result[0].id
}

module.exports = {
    userLogin,
    getUser,
    checkUser,
    getUserId
}