const Classroom = require("../models/classroom");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");

const userCheck = catchAsync(async (req, res, next) => {
  let user = await User.findOne(req?.user).select("userType");
  if (!user) {
    return next(new AppError("User Not Found!!", 401));
  }
  res.status(200).json({ msg: "OK", userType: user?.userType });
});

const createClass = catchAsync(async (req, res, next) => {
  let { className, selectedDays, assignedTeacher } = req.body;

  let user = await User.findOne(req?.user).select("userType");

  if (user.userType !== "Principal") {
    return next(new AppError("Action Restricted!!", 401));
  }

  if (!className || !selectedDays || selectedDays.length === 0) {
    return next(new AppError("Classname & Schedule is must!!", 401));
  }

  const newClass = new Classroom({
    name: className,
    schedule: selectedDays,
  });

  if (assignedTeacher && assignedTeacher !== "") {
    let teacher = await User.findById(assignedTeacher);
    if (!teacher || teacher?.userType !== "Teacher") {
      return next(new AppError("Invalid Teacher!!", 401));
    }

    if (teacher?.assignedClass && teacher?.assignedClass !== "") {
      return next(new AppError("Teacher is already taking a class", 401));
    }
    newClass.teacher = teacher;
  }

  await newClass.save();

  res.status(200).json({ msg: "OK" });
});

const fetchUsers = catchAsync(async (req, res, next) => {
  let { userType } = req.params;

  if (userType !== "Teacher" && userType !== "Student") {
    return next(new AppError("Invalid Usertype!!", 401));
  }

  let user = await User.findOne(req?.user).select("userType");

  if (
    (user.userType === "Teacher" && userType === "Teacher") ||
    (user.userType === "Student" && userType === "Teacher")
  ) {
    return next(new AppError("Action Restricted!!", 401));
  }

  let users = await User.find({ userType });
  res.status(200).json({ msg: "OK", users });
});

const fetchClasses = catchAsync(async (req, res, next) => {
  let user = await User.findOne(req?.user).select("userType");

  if (user?.userType !== "Principal" && user?.userType !== "Teacher") {
    return next(new AppError("Action Restricted!!", 401));
  }

  let classes = await Classroom.find({}).select("name").select("teacher");
  res.status(200).json({ msg: "OK", classes });
});

const fetchCurrUser = catchAsync(async (req, res, next) => {
  let user = await User.findOne(req?.user).populate("assignedClass");
  if (!user) {
    return next(new AppError("Invalid User!!", 401));
  }
  res.status(200).json({ msg: "OK", user });
});

module.exports = {
  userCheck,
  createClass,
  fetchUsers,
  fetchClasses,
  fetchCurrUser,
};
