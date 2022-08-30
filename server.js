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
const { Story } = require('./models/story')
const { USER, User } = require('./models/user') //imoirting USER model: 



const app = express() 
app.use(express.static('public'))
app.use(express.json()) //looks at any requests that comes in that has json in it and parses it into a JS object that you can access the keys and use like a regular object so that my app can manipulate it.
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(cookieParser())


//INDEX ---------------------> READY
app.get('/stories', (req, res) => {
    // res.send('Index route showing all stories')
    console.log('GIVE ME BACK MY GNOME')
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

//shows user's stories 
app.get('/stories/user/:id', (req, res, next) => {
    console.log('getting all stories by user ID')

    Story.find({ author: req.params.id })
        .then((stories) => {
            res.render('index.ejs', { stories })
        })

        
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
app.get('/stories/:id/edit', (req, res) => {

    const token = req.cookies.access_token
    const decodedToken = jwt.verify(token, JWT_KEY_SECRET)

    Story.findById(req.params.id)
        .then((story) => {
            console.log(story)
            if(story.author.id === decodedToken.userId) {
                console.log('edit access aproved')
                res.render('edit.ejs', { story })
            } else {
                console.log('access denied')
                res.redirect('/stories')
            }
        })
    
})

//UPDATE
app.put('/stories/:id', (req, res) => {

    const token = req.cookies.access_token
    const decodedToken = jwt.verify(token, JWT_KEY_SECRET)

    Story.findById(req.params.id)
        .then((story) => {
            if(story.author.id === decodedToken.userId) {
                console.log('access granted')
                const newBody = {title: req.body.title, storyText: req.body.storyText}

                Story.findByIdAndUpdate(req.params.id, {$set: newBody}, {new: true}, (err, updatedModel) => {
                res.redirect('/stories')
                })
            } else {
                console.log('access denied')
                res.redirect('/stories')
            }
        })

    
})

//DELETE
app.delete('/stories/:id', (req, res) => {
    
    const token = req.cookies.access_token
    const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
    
    Story.findById(req.params.id)
        .then((story) => {
            console.log(story)
            if(story.author.id === decodedToken.userId) {
                console.log('you got it chief')
                Story.findByIdAndRemove(req.params.id, (err, data) => {
                    if(err) console.log(err)
                    res.redirect(`/stories/user/${decodedToken.userId}`)
                })
            } else { 
                console.log('no can do')
                res.redirect('/stories')
            }
        })
    
        
})

//------------------------------------------
//USER ROUTES

//INDEX
app.get('/users', (req, res, next) => {
    User.find().then(users => {
        res.render('users/users.ejs', { users })
    })
})

//NEW
app.get('/users/new', (req, res, next) => {
    res.render('users/newuser.ejs')
})

//CREATE
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
    bcrypt.hash(password, 12) //anything higher than 20 would take days to encrypt and decrypt
        .then(encryptedPw => {
            console.log(`Finished encrypting password: ${encryptedPw}`)
            const newUser = { firstName, lastName, email, password: encryptedPw }

            User.create(newUser)
                .then(usr => {
                    const token = jwt.sign(
                        { userId: usr.id, email: usr.email }, //payload
                        JWT_KEY_SECRET, //server secret
                        { expiresIn: '1hr' }
                    )
                        // const response = { user: usr, token }
                        // return res.send(response)

                        return res.cookie('access_token', token)
                            .redirect('/users')
                        
                })
        })

})  

//LOGIN - GET
app.get('/login', (req, res) => {
    res.render('users/login.ejs')
})

//LOGIN - POST
app.post('/login', (req, res, next) => {
    
    //normalize email:
    req.body.email.toLowerCase()

    //lets check if the user exists: 
    User.findOne({ email: req.body.email })
        .then((usr) => {
            console.log(usr)
            if(!usr){
                return res.send('email not found')
            } //end of email check

            //now that the user exists, we'll check if the req.body.password matches the user's password: 
            bcrypt.compare(req.body.password, usr.password) //bcrypt.compare is a method that returns TRUE or FALSE
                .then((matched) => {
                    if(matched === false){
                        return res.send('invalid password, try again')
                    } 
                    const token = jwt.sign(
                        { userId: usr.id, email: usr.email }, 
                        JWT_KEY_SECRET, 
                        { expiresIn: '1hr' }
                    )

                    return res.cookie('access_token', token)
                        .redirect('/users')
                })

        })
      
})

//LOGOUT
app.get('/logout', (req, res) => {
    const token = req.cookies.access_token
    console.log(token)
    if(!token) {
        return res.send('Failed to logout')
    }
    const data = jwt.verify(token, JWT_KEY_SECRET)
    console.log(data)

    return res.clearCookie('access_token')
        .redirect('/login')
})



//------------------------------------------
mongoose.connect(DATABASE_URL, () => {
    app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`)
    })
})


