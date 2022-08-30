const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')

//authentication
const { check } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//Instead of using mongoose's promise-like system, we'll be using Javascript's promise system: 
mongoose.Promise = global.Promise


const { DATABASE_URL, PORT, JWT_KEY_SECRET } = require('./config')
const storiesRouter = require('./routers/storiesRouter')
const usersRouter = require('./routers/usersRouter')


const app = express() 
app.use(express.static('public'))
app.use(express.json()) //looks at any requests that comes in that has json in it and parses it into a JS object that you can access the keys and use like a regular object so that my app can manipulate it.
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(cookieParser())


//STORY ROUTES USE TO BE HERE 

app.use('/stories', storiesRouter )

//------------------------------------------
//USER ROUTES USE TO BE HERE

app.use('/users', usersRouter )

//------------------------------------------
mongoose.connect(DATABASE_URL, () => {
    app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`)
    })
})



