// server/routes/compileRoutes.js
const express = require("express");
const router = express.Router();
const { compileAndRun, getLanguages } = require("../controllers/runnerController");

router.post("/compile", compileAndRun);
router.get("/languages", getLanguages);

module.exports = router;
