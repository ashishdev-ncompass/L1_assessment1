const { executeQuery } = require("../Utilities/db");
const { makeResponse } = require("../Utilities/responseMaker");
const { errorObjectCreator } = require("../Utilities/errorHandler");
const moment = require("moment");
const { getUserId } = require("../User/controller");

// Default error code is set to 500 and it is changed whenever needed.
var errorCode = 500;

const createAnswer = async (req, res, next) => {
    try {
        let data = req.body;
        if (checkPost(data.postId)) {
            const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
            let token = req.header("authorization").split(" ")[1];
            const userId = await getUserId(token);
            const inputData = [[[userId, data.postId, data.answer, currentTime]]];

            let query = `insert into answer(user_id, post_id, answer, created_time) values ?`;
            let result = await executeQuery(query, inputData).catch(function reject(
                error
            ) {
                throw error;
            });

            return res.json(makeResponse(`Answer submitted successfully`));
        } else {
            throw new Error("post not found");
        }
    } catch (error) {
        let errorObject = errorObjectCreator(
            "error while creating post",
            errorCode,
            error
        );
        next(errorObject);
    }
};

const getAllAnswers = async (req, res, next) => {
    try {
        // extracting data from query parameters
        let data = req.query;
        let pageNumber = data.page;
        let result = [];
        if (pageNumber == null) {
            throw new Error("page number not provided");
        }
        let endingIndex = 2 * (pageNumber - 1);
        let query = "";
        let inputdata = [`%${data.title}%`,endingIndex]
        if (data.column != null) {
            query = `select ${data.column} from answer as a inner join post as p on p.post_id = a.post_id where p.title like ? order by a.created_time desc limit 2 offset ?`;
        } else {
            query = `select a.* from answer as a inner join post as p on p.post_id = a.post_id where p.title like ? order by a.created_time desc limit 2 offset ?`;
        }
        result = await executeQuery(query,inputdata).catch(function reject(error) {
            throw error;
        });

        // checking if object result is empty or not
        if (Object.keys(result).length == 0) {
            errorCode = 404;
            throw new Error("answer not found");
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
            "error while reading answer by post id",
            errorCode,
            error
        );
        next(errorObject);
    }
};

const checkPost = async (postId) => {
    const inputData = [postId];
    let query = `select * from post where post_id = ?`;
    let result = await executeQuery(query, inputData).catch(function reject(
        error
    ) {
        throw error;
    });

    // checking if object result is empty or not
    if (Object.keys(result).length == 0) {
        return false;
    } else {
        return true;
    }
};

module.exports = {
    createAnswer,
    getAllAnswers,
};
