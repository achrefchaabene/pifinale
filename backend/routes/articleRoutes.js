const express = require("express");
const { getLatestAlzheimerArticles } = require("../controllers/articleController");

const router = express.Router();

router.get("/alzheimer", getLatestAlzheimerArticles);

module.exports = router;
