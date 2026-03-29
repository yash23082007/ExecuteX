// server/routes/shareRoutes.js
const express = require("express");
const router = express.Router();
const { createShare, getShare } = require("../controllers/shareController");

router.post("/share", createShare);
router.get("/share/:slug", getShare);

module.exports = router;
