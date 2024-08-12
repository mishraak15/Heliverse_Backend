const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");
const homeRoute = require("./routers/homeRoute");
const addNewRoute = require("./routers/addNewRoute");
const userRoute = require("./routers/userRoute");

const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.SERVER_PORT || 8000;
const MONGO_ATLAS_URL = process.env.MONGO_ATLAS_URL;

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.use(bodyParser.urlencoded({ limit: "10kb", extended: false }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function main() {
  await mongoose.connect(MONGO_ATLAS_URL);
}

main()
  .then((res) => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/", homeRoute);
app.use("/add/new", addNewRoute);
app.use("/:id", userRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`App is listening at port: ${PORT}`);
});
