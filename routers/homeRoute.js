const express = require("express");
const { login, protect, logout } = require("../controllers/authController");
const {
  userCheck,
  createClass,
  fetchUsers,
  fetchClasses,
  fetchCurrUser,
} = require("../controllers/homeController");
const router = express.Router();

router.post("/login", login);

router.use(protect);

router.get("/", userCheck);
router.post("/createClassroom", createClass);
router.get("/fetchall/:userType", fetchUsers);
router.get("/fetch/classes", fetchClasses);
router.get("/fetch/currUser", fetchCurrUser);

router.get("/logout", logout);

module.exports = router;
