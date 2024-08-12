const express = require("express");
const { protect } = require("../controllers/authController");
const {
  deleteUser,
  getUserData,
  editUserData,
} = require("../controllers/userController");
const router = express.Router({ mergeParams: true });

router.use(protect);

router.delete("/", deleteUser);
router.get("/", getUserData);
router.patch("/", editUserData);

module.exports = router;
