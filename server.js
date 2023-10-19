const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const cors = require("cors");
var bodyParser = require("body-parser");

//---------------
const imgbbUploader = require("imgbb-uploader");
/* or use import in ESM projects:
import { imgbbUploader } from "imgbb-uploader"; 
*/
//----------

// //authentication
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

//Instead of using mongoose's promise-like system, we'll be using Javascript's promise system:
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT, JWT_KEY_SECRET } = require("./config");
//insert Routers here *******
const storiesRouter = require("./routers/storiesRouter");
const usersRouter = require("./routers/usersRouter");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "200mb" })); //looks at any requests that comes in that has json in it and parses it into a JS object that you can access the keys and use like a regular object so that my app can manipulate it.
app.use(express.urlencoded({ limit: "200mb", extended: false }));
app.use(methodOverride("_method"));
app.use(cookieParser());
// app.use(cors())

//rolled out our own cors middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Origin, X-Requested-With, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.post("/imageupload", cors(), (req, res, next) => {
  console.log("you've reached the imageupload route");
  console.log(req.body);
  // const options = {
  //   apiKey: "cacaa3c91ff066da98b3a1e60e1fe8d0", // MANDATORY apikey for imgBB
  //   base64string: req.body.base64string,
  //   // OPTIONAL: pass base64-encoded image (max 32Mb)
  // };
  // imgbbUploader(options)
  //   .then((response) => {
  //     res.json(response);
  //   })
  //   .catch((error) => console.error(error));
});

app.post("/originalimageupload", cors(), (req, res, next) => {
  const options = {
    apiKey: "cacaa3c91ff066da98b3a1e60e1fe8d0", // MANDATORY apikey for imgBB
    base64string: req.body.base64string,
    // OPTIONAL: pass base64-encoded image (max 32Mb)
  };
  imgbbUploader(options)
    .then((response) => {
      res.json(response);
    })
    .catch((error) => console.error(error));
});

//STORY ROUTES USE TO BE HERE

app.use("/stories", storiesRouter);

//------------------------------------------
//USER ROUTES USE TO BE HERE

app.use("/users", usersRouter);

//------------------------------------------
const startServer = async () => {
  try {
    await mongoose.connect(DATABASE_URL);
    app.listen(PORT, () => {
      console.log(`Your app is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

startServer();

/*
mongoose.connect(DATABASE_URL).then(() => {
  app.listen(PORT, () => {
    console.log(`Your app is listening on port ${PORT}`);
  });
});
*/

//now we have mongoose calling the app.listen to boot up the server, but ALSO he is connecting us to the DATABASE
