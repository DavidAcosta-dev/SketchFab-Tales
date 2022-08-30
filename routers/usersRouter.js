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
const { User } = require('../models/user') //imoirting USER model: 
const { 
    getAllUsers,
    sendNewUserForm,
    createNewUser,
    sendLoginForm,
    login,
    logout
} 
 = require('../controllers/usersController')


//INDEX
router.get('/', getAllUsers)

//NEW
router.get('/new', sendNewUserForm)

//CREATE   
router.post('/signup', createNewUser)

//LOGIN - GET
router.get('/login', sendLoginForm)

//LOGIN - POST
router.post('/login', login)

//LOGOUT
router.get('/logout', logout)

module.exports = router