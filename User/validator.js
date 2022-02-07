const Joi = require("joi");
const { errorObjectCreator } = require("../Utilities/errorHandler");

const schema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string(),
});

const validateData = (data) => {
    return schema.validate(data);
};

const validateUser = (req, res, next) => {
    let errorCode = 400;
    var data = req.body;
    let validationResult = validateData(data);
    if (validationResult.error) {
        let errorObject = errorObjectCreator(
            "error in validation !!!!",
            errorCode,
            validationResult.error
        );
        next(errorObject);
    }
    else {
        next();
    }
}

module.exports = {
    validateUser
}