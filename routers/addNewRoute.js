const express = require("express");
const { protect } = require("../controllers/authController");
const { addUser } = require("../controllers/addController");
const router = express.Router();

router.use(protect);

router.post("/:userType", addUser);

module.exports = router;
