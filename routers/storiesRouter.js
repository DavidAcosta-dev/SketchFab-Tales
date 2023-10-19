const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
// const methodOverride = require('method-override')
// const cookieParser = require('cookie-parser')

//authentication
// const { check } = require('express-validator')
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

//Instead of using mongoose's promise-like system, we'll be using Javascript's promise system:
mongoose.Promise = global.Promise;

// const { DATABASE_URL, PORT, JWT_KEY_SECRET } = require('../config')
// const { Story } = require('../models/story')
const { checkauth } = require("../middleware/checkauth"); //check authentication middleware function
const {
  getAllStories,
  sendNewStoryForm,
  getStoryById,
  getStoriesByUserId,
  createNewStory,
  sendEditStoryForm,
  updateStoryById,
  deleteStoryById,
} = require("../controllers/storiesController");
// const { application } = require("express");

//==============ROUTES============================

//INDEX --------------------->
router.get("/", getAllStories);

//NEW ---------------------->
router.get("/new", checkauth, sendNewStoryForm);

//SHOW   ----------------->
router.get("/:id", getStoryById);

//shows user's stories
router.get("/user/:id", getStoriesByUserId);

router.use(checkauth); //MIDDLEWARE <--------------------------------🔏

//CREATE - AUTHENTICATION  -------------------> READY
router.post("/", createNewStory);

//EDIT - AUTHENTICATION
router.get("/:id/edit", sendEditStoryForm);

//UPDATE - AUTHENTICATION
router.put("/:id", updateStoryById);

//DELETE - AUTHENTICATION
router.delete("/:id", deleteStoryById);

module.exports = router;
