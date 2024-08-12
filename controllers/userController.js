const Classroom = require("../models/classroom");
const User = require("../models/user");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");

const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  let user = await User.findOne(req?.user).select("userType");

  let userToBeDeleted = await User.findById(id).select("userType");

  if (
    !user ||
    user?.userType === "Student" ||
    (user?.userType === "Teacher" && userToBeDeleted.userType !== "Student")
  ) {
    return next(new AppError("Action Restricted!!", 401));
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({ msg: "OK" });
});

const getUserData = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  let user = await User.findOne(req?.user).select("userType");

  let userData = await User.findById(id).populate("assignedClass");

  if (
    !user ||
    user?.userType === "Student" ||
    (user?.userType === "Teacher" && userData?.userType !== "Student")
  ) {
    return next(new AppError("Action Restricted!!", 401));
  }

  if (!id || !userData) {
    return next(new AppError("User not found!!", 404));
  }

  res.status(200).json({ msg: "OK", userData });
});

const editUserData = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { formData } = req.body;

  let name = formData?.name;
  let email = formData?.email;
  let password = formData?.password;
  let newPassword = formData?.newPassword;
  let assignedClass = formData?.assignedClass || "";

  let user = await User.findOne(req?.user).select("userType");

  let userToEdit = await User.findById(id)?.populate("assignedClass");

  if (
    !user ||
    user?.userType === "Student" ||
    (user?.userType === "Teacher" && userToEdit?.userType !== "Student")
  ) {
    return next(new AppError("Action Restricted!!", 401));
  }

  if (!email) {
    return next(new AppError("Email is required!!"));
  }

  if (
    (password === "" && newPassword !== "") ||
    (newPassword === "" && password !== "")
  ) {
    return next(
      new AppError("Both Current Password & New Password is required!!")
    );
  }

  if (
    password !== "" &&
    !(await bcrypt.compare(password, userToEdit.password))
  ) {
    return next(new AppError("Incorrect Password!!"));
  }

  if (newPassword !== "" && newPassword.length <= 5) {
    return next(new AppError("Password should be greater than 5 characters"));
  }

  userToEdit.email = email;
  userToEdit.name = name || "";

  if (newPassword && newPassword !== "") {
    userToEdit.password = newPassword;
  }

  if (!assignedClass || assignedClass.length === 0) {
    return next(new AppError("Invalid Class!!"));
  }
  let classToBeAdded = await Classroom?.findById(assignedClass)?.populate(
    "students"
  );

  if (!classToBeAdded) {
    return next(new AppError("Invalid Class!!"));
  }

  let preClass = userToEdit?.assignedClass;

  if (preClass && userToEdit?.userType === "Teacher") {
    let preId = preClass?._id;
    await Classroom.updateOne({ _id: preId }, { $unset: { teacher: "" } });
  }

  if (userToEdit?.userType === "Teacher") {
    classToBeAdded.teacher = userToEdit?._id;
  }

  if (preClass && userToEdit?.userType === "Student") {
    let preId = preClass?._id;
    await Classroom.updateOne(
      { _id: preId },
      { $pull: { students: userToEdit._id } }
    );
  }

  if (userToEdit?.userType === "Student") {
    if (!classToBeAdded.students.some((x) => x._id === userToEdit._id)) {
      classToBeAdded.students.push(userToEdit?._id);
    }
  }

  userToEdit.assignedClass = classToBeAdded;

  await userToEdit.save();
  await classToBeAdded.save();

  res.status(200).json({ msg: "OK" });
});

module.exports = { deleteUser, getUserData, editUserData };
