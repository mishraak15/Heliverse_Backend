const Classroom = require("../models/classroom");
const User = require("../models/user");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const addUser = catchAsync(async (req, res, next) => {
  const { userType } = req.params;
  const { formData } = req.body;

  let name = formData?.name;
  let email = formData?.email;
  let password = formData?.password;
  let confirmPassword = formData?.confirmPassword;
  let assignedClass = formData?.assignedClass;

  let user = await User.findOne(req?.user).select("userType");

  if (
    !user ||
    user?.userType === "Student" ||
    (user?.userType === "Teacher" && userType !== "Student")
  ) {
    return next(new AppError("Action Restricted!!", 401));
  }

  if (!email || !password || !confirmPassword || !assignedClass) {
    return next(
      new AppError("Email, Class, Password & ConfirmPassword is required!!")
    );
  }

  if (password.length <= 5) {
    return next(new AppError("Password should be greater than 5 characters!!"));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Password & Confirm Password should be same!!"));
  }

  let classToBeAdded = await Classroom.findById(assignedClass);
  if (!classToBeAdded) {
    return next(new AppError("Invalid, Class not found!"));
  }

  let newUser = new User({
    name,
    email,
    password,
    userType,
    assignedClass,
  });

  if (userType === "Student") {
    if (classToBeAdded.students.some((x) => x.email === email)) {
      return next(new AppError("Student already in class!"));
    }
    classToBeAdded.students.push(newUser);
  }

  if (userType === "Teacher") {
    if (classToBeAdded?.teacher && classToBeAdded?.teacher !== "") {
      return next(
        new AppError("This class is already administered by a teacher!")
      );
    }
    classToBeAdded.teacher = newUser?._id;
  }

  await classToBeAdded.save();
  await newUser.save();

  res.status(200).json({ msg: "OK" });
});

module.exports = { addUser };
