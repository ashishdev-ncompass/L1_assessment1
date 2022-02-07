const Joi = require("joi");
const { errorObjectCreator } = require("../Utilities/errorHandler");

const schema = Joi.object({
    postId: Joi.number().min(10000),

    title: Joi.string(),

    description: Joi.string(),

    tag: Joi.string(),

    column: Joi.string(),

    page: Joi.number().min(1),
});

const createPostSchema = Joi.object({
    title: Joi.string().required(),

    description: Joi.string().required(),

    tag: Joi.string(),
});

const validateData = (data) => {
    return schema.validate(data);
};

const validateCreatePost = (data) => {
    return createPostSchema.validate(data);
};

const validatePost = (req, res, next) => {
    let errorCode = 400;
    let data = "";
    if (req.method === "GET") {
        data = req.query;
    } else {
        data = req.body;
    }
    if (req.route.path === "/createPost") {
        let validationResult = validateCreatePost(data);
        if (validationResult.error) {
            let errorObject = errorObjectCreator(
                "error in validation !!!!",
                errorCode,
                validationResult.error
            );
            next(errorObject);
        } else {
            next();
        }
    } else {
        let validationResult = validateData(data);
        if (validationResult.error) {
            let errorObject = errorObjectCreator(
                "error in validation !!!!",
                errorCode,
                validationResult.error
            );
            next(errorObject);
        } else {
            next();
        }
    }
};

module.exports = {
    validatePost,
};
