const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')

//authentication
const { check } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//Instead of using mongoose's promise-like system, we'll be using Javascript's promise system: 
mongoose.Promise = global.Promise


const { DATABASE_URL, PORT } = require('./config')
const { Story } = require('./models/story')
const { USER, User } = require('./models/user') //imoirting USER model: 



const app = express() 
app.use(express.static('public'))
app.use(express.json()) //looks at any requests that comes in that has json in it and parses it into a JS object that you can access the keys and use like a regular object so that my app can manipulate it.
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))


//INDEX ---------------------> READY
app.get('/stories', (req, res) => {
    // res.send('Index route showing all stories')
    Story.find().then(stories => {
        res.render('index.ejs', { stories })
    }) 
    
})

//NEW ----------------------> READY
app.get('/stories/new', (req, res) => {
    res.render('new.ejs')
})

//SHOW   -----------------> READY
app.get('/stories/:id', async (req, res) => {
    // res.send(req.params.id)
    const story = await Story.findById(req.params.id)
    res.render('show.ejs', { story })
    
})

//CREATE -------------------> READY
app.post('/stories', (req, res) => {
    console.log('potatoes')
    console.log(req.body) //looking at the data that the user sent
    const requiredFields = ['title', 'storyText', 'author']
    
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i]
        if(!(field in req.body)){
            const errorMessage = `missing ${field} in request body`
            console.error(errorMessage) 
            return res.send(errorMessage)
        }
    }

    Story.create(req.body, (err, createdStory) => {
        if(err) {
            console.log(err)
            res.send(err)
        } else {
            res.redirect('/stories')
        }
    })

    console.log(req.body)

})

//EDIT
app.get('/stories/:id/edit', async (req, res) => {
    const story = await Story.findById(req.params.id)
    res.render('edit.ejs', { story })
    
})

//UPDATE
app.put('/stories/:id', (req, res) => {
     Story.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, updatedModel) => {
        res.redirect('/stories')
    })
})

//DELETE
app.delete('/stories/:id', (req, res) => {
    Story.findByIdAndRemove(req.params.id, (err, data) => {
        if(err) console.log(err)
        res.redirect('/stories')
    })
})

//------------------------------------------
//USER ROUTES

//POST new user
app.post('/signup', (req, res, next) => {
    console.log('Posting New User')

    const requiredFields = ['firstName', 'lastName', 'email', 'password']

    for(let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i]
        if(!(field in req.body)) {
            const errorMessage = `missing ${field} in request body`
            console.error(errorMessage)
            return res.send(errorMessage)
        }
    }

    //normalizing email
    req.body.email = req.body.email.toLowerCase()
    console.log(req.body)

    const { firstName, lastName, email, password } = req.body

    //hashing the password with bcrypt
    bcrypt.hash(password, 12)
        .then(encryptedPw => {
            console.log(`Finished encrypting password: ${encryptedPw}`)
            const newUser = { firstName, lastName, email, password: encryptedPw }

            User.create(newUser)
                .then(usr => {
                    return res.send(usr)
                })
        })

})

//INDEX
app.get('/users', (req, res, next) => {
    User.find().then(users => {
        res.render('users/users.ejs', { users })
    })
})

//
app.get('/stories/user/:id', (req, res, next) => {
    console.log('getting all stories by user ID')

    Story.find({ author: req.params.id })
        .then((stories) => {
            res.render('index.ejs', { stories })
        })

        
})


//------------------------------------------
mongoose.connect(DATABASE_URL, () => {
    app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`)
    })
})


