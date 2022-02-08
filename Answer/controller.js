const { executeQuery } = require("../Utilities/db");
const { makeResponse } = require("../Utilities/responseMaker");
const { errorObjectCreator } = require("../Utilities/errorHandler");
const moment = require("moment");
const { getUserId } = require("../User/controller");



const errorCode = 500;



const createAnswer = async (req, res, next) => {
    try {
        let data = req.body;
        if (checkPost(data.postId)) {
            const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
            let token = req.header("authorization").split(" ")[1];
            const userId = await getUserId(token);
            const inputData = [[[userId, data.postId, data.answer, currentTime]]];
            let query = `insert into answer(user_id, post_id, answer, created_time) values ?`;
            let result = await executeQuery(query, inputData).catch(
                function reject(error) {
                    throw error;
                }
            );
            return res.json(makeResponse(`Answer submitted successfully`));
        }
        else {
            throw new Error("post not found");
        }
    }
    catch (error) {
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
        let data = req.query;
        let pageNumber = data.page;
        let result = [];
        if (pageNumber == null) {
            throw new Error("page number not provided");
        }
        let offset = 2 * (pageNumber - 1);
        let query = getAnswerQuery(data, offset);
        result = await executeQuery(query[1], query[0]).catch(
            function reject(error) {
                throw error;
            }
        );
        if (Object.keys(result).length == 0) {
            errorCode = 404;
            throw new Error("answer not found");
        }
        else {
            return res.json(makeResponse("query successful!!", result));
        }
    }
    catch (error) {
        let errorObject = errorObjectCreator(
            "error while reading answer by post id",
            errorCode,
            error
        );
        next(errorObject);
    }
};



const getAnswerQuery = (data, offset) => {
    let inputdata = [];
    let query = "";
    if (data.column != null) {
        data.column = data.column.replace(/\s+/g, '');
        let columnNames = data.column.split(',');
        for(let i=0;i<columnNames.length;i++){
            columnNames[i] = `answer.${columnNames[i]}`;
        }
        inputdata = [columnNames,`%${data.title}%`, offset]
        query = `select ?? from answer left join post on post.post_id = answer.post_id 
            where post.title like ? order by answer.created_time desc limit 2 offset ?`;
    }
    else {
        inputdata = [`%${data.title}%`, offset]
        query = `select answer.answer_id, answer.user_id, answer.post_id, 
            answer.answer, answer.created_time from answer left join post
            on post.post_id = answer.post_id where post.title like ? 
            order by answer.created_time desc limit 2 offset ?`;
    }
    return [inputdata,query];
}



const checkPost = async (postId) => {
    const inputData = [postId];
    let query = `select * from post where post_id = ?`;
    let result = await executeQuery(query, inputData).catch(
        function reject(error) {
            throw error;
        }
    );
    if (Object.keys(result).length == 0) {
        return false;
    }
    else {
        return true;
    }
};



module.exports = {
    createAnswer,
    getAllAnswers,
};
