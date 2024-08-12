const AppError = require("../utils/AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} :  ${err.value}`;
  return new AppError(message);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Invalid duplicate field: ${field} - ${value}, Please try a different value`;
  return new AppError(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please login again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Token Expired. please try again", 401);

const sendError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status || "Error",
    error: err,
    message: err.message || "Something Went Wrong",
    // stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  if (err.kind === "ObjectId") err = handleCastErrorDB(err);

  if (err.code === 11000) err = handleDuplicateFieldsDB(err);

  if (err.name === "ValidationError") err = handleValidationErrorDB(err);

  if (err.name === "JsonWebTokenError") err = handleJWTError();
  if (err.name === "TokenExpiredError") err = handleJWTExpiredError();

  sendError(err, res);
  next();
};
