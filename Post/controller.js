const { executeQuery } = require("../Utilities/db");
const { makeResponse } = require("../Utilities/responseMaker");
const { errorObjectCreator } = require("../Utilities/errorHandler");
const moment = require("moment");
const { getUserId } = require("../User/controller");

// Default error code is set to 500 and it is changed whenever needed.
var errorCode = 500;

const getPostDetails = async (req, res, next) => {
    try {
        // extracting data from query parameters
        let data = req.query;
        let query = "";
        
        let pageNumber = data.page;
        let result = [];
        let pseudoResult = [];
        if (pageNumber == null) {
            throw new Error("page number not provided");
        }
        let endingIndex = 2 * (pageNumber - 1);
        let inputData = [];
        if (data.tag != null) {
            inputData = [`%${data.tag}%`,endingIndex];
            query = `select * from post where tag like ? order by created_time desc limit 2 offset ?`;
            let tempResult = await executeQuery(query, inputData).catch(
                function reject(error) {
                    throw error;
                }
            );
            if (Object.keys(tempResult).length != 0) {
                pseudoResult = tempResult;
            }
        }
        if (data.title != null) {
            inputData = [`%${data.title}%`,endingIndex];
            query = `select * from post where title like ? order by created_time desc limit 2 offset ?`;
            let tempResult = await executeQuery(query, inputData).catch(
                function reject(error) {
                    throw error;
                }
            );
            if (Object.keys(tempResult).length != 0) {
                result = pseudoResult.concat(tempResult);
            }
        }
        
        if (Object.keys(result).length == 0) {
            errorCode = 404;
            throw new Error("data not found");
        } else {
            return res.json(
                makeResponse(
                    "query successful!!",
                    result
                )
            );
        }
    } catch (error) {
        let errorObject = errorObjectCreator(
            "error while fetching post",
            errorCode,
            error
        );
        next(errorObject);
    }
};

const createPost = async (req, res, next) => {
    try {
        let data = req.body;
        const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
        let token = req.header("authorization").split(" ")[1];
        const userId = await getUserId(token);
        const inputData = [
            [[userId, data.title, data.description, data.tag, currentTime]],
        ];

        let query = `insert into post(user_id, title, description, tag, created_time) values ?`;
        let result = await executeQuery(query, inputData).catch(function reject(
            error
        ) {
            throw error;
        });

        return res.json(makeResponse(`Post created successfully`));
    } catch (error) {
        let errorObject = errorObjectCreator(
            "error while creating post",
            errorCode,
            error
        );
        next(errorObject);
    }
};

const updatePost = async (req, res, next) => {
    try {
        let data = req.body;
        let token = req.header("authorization").split(" ")[1];
        const userId = await getUserId(token);
        const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
        const inputData = [
            Object.values(data)[1],
            currentTime,
            data.postId,
            userId,
        ];

        let query = `update post set ${data.column} = ?, created_time = ? where post_id = ? and user_id = ?`;

        let result = await executeQuery(query, inputData).catch(function reject(
            error
        ) {
            throw error;
        });
        // checking if any data was affected or not
        if (result.affectedRows == 0) {
            errorCode = 400;
            throw new Error("either post does not exists or someone else is author");
        }
        return res.json(
            makeResponse(
                `your updated ${data.column} is ${Object.values(data)[1]} for post id ${data.postId
                }`
            )
        );
    } catch (error) {
        errorCode = 400;
        let errorObject = errorObjectCreator(
            "error while updating post",
            errorCode,
            error
        );
        next(errorObject);
    }
};

const deletePost = async (req, res, next) => {
    try {
        let data = req.body;
        let token = req.header("authorization").split(" ")[1];
        const userId = await getUserId(token);
        const inputData = [data.postId, userId];
        query = `delete from post where post_id = ? and user_id = ?`;

        result = await executeQuery(query, inputData).catch(function reject(error) {
            throw error;
        });
        if (result.affectedRows == 0) {
            errorCode = 400;
            throw new Error("either post does not exists or someone else is author");
        }

        query = `delete from answer where post_id = ?`;
        result = await executeQuery(query, inputData).catch(function reject(error) {
            throw error;
        });

        return res.json(makeResponse(`post deleted !!`));
    } catch (error) {
        let errorObject = errorObjectCreator(
            "error while deleting post",
            errorCode,
            error
        );
        next(errorObject);
    }
};

module.exports = {
    getPostDetails,
    createPost,
    updatePost,
    deletePost,
    getUserId,
};
