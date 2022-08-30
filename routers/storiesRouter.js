const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')

//authentication
const { check } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//Instead of using mongoose's promise-like system, we'll be using Javascript's promise system: 
mongoose.Promise = global.Promise


const { DATABASE_URL, PORT, JWT_KEY_SECRET } = require('../config')
const { Story } = require('../models/story')
const { 
        getAllStories, 
        sendNewStoryForm, 
        getStoryById, 
        getStoriesByUserId, 
        createNewStory, 
        sendEditStoryForm , 
        updateStoryById, 
        deleteStoryById
    } 
     = require('../controllers/storiesController')


//INDEX ---------------------> READY 
router.get('/', getAllStories)

//NEW ----------------------> READY
router.get('/new', sendNewStoryForm)

//SHOW   -----------------> READY
router.get('/:id',  getStoryById) 

//shows user's stories 
router.get('/user/:id', getStoriesByUserId) 

//CREATE - AUTHENTICATION  -------------------> READY
router.post('/', createNewStory)

//EDIT - AUTHENTICATION
router.get('/:id/edit', sendEditStoryForm)

//UPDATE - AUTHENTICATION
router.put('/:id', updateStoryById)

//DELETE - AUTHENTICATION
router.delete('/:id', deleteStoryById)

module.exports = router