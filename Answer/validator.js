const Joi = require("joi");
const { errorObjectCreator } = require("../Utilities/errorHandler");

const schema = Joi.object(
{
    postId: Joi.number().min(10000),

    answer: Joi.string(),

    title: Joi.string(),

    column: Joi.string(),

    page: Joi.number(),
});

const validateData = (data) => 
{
    return schema.validate(data);
};

const validateAnswer = (req, res, next) => 
{

    let errorCode = 400;
    let data = "";

    if (req.method === "GET") 
    {
        data = req.query;
    } 
    else 
    {
        data = req.body;
    }

    let validationResult = validateData(data);

    if (validationResult.error) 
    {
        let errorObject = errorObjectCreator(
            "error in validation !!!!",
            errorCode,
            validationResult.error
        );
        next(errorObject);
    } 
    else 
    {
        next();
    }
    
};

module.exports = {
    validateAnswer,
};
