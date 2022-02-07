const express = require("express");
const {validateUser} = require("../User/validator")
const { validateToken } = require("../User/tokenValidation");
const {
    userLogin,
} = require("../User/controller");
const bodyParser = require("body-parser");
const { createPost, updatePost, deletePost, getPostDetails } = require("../Post/controller");
const { validatePost } = require("../Post/validator");
const { validateAnswer } = require("../Answer/validator");
const { createAnswer, getAllAnswers } = require("../Answer/controller");


const router = express.Router();

//router.use(compression({level:9}));
router.use(bodyParser.json());
router.use(express.static("public"));


router.post("/login", validateUser, userLogin);

router.post("/createPost", validateToken, validatePost, createPost);

router.post("/updatePost", validateToken, validatePost, updatePost);

router.post("/deletePost", validateToken, validatePost, deletePost);

router.get("/getPostDetails", validatePost, getPostDetails);

router.post("/createAnswer", validateToken, validateAnswer, createAnswer);

router.get("/getAllAnswers", validateAnswer, getAllAnswers);

module.exports = router;