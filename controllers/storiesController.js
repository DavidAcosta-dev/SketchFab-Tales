const express = require('express')

const mongoose = require('mongoose')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')

//authentication
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//Instead of using mongoose's promise-like system, we'll be using Javascript's promise system: 
mongoose.Promise = global.Promise


const { DATABASE_URL, PORT, JWT_KEY_SECRET } = require('../config')
const { Story } = require('../models/story')
const { User } = require('../models/user') //imoirting USER model: 


//-----------PURE LOGIC FOR HANDLING THE REQUESTS----------------------

//INDEX 
const getAllStories = (req, res, next) => {
     // res.send('Index route showing all stories')
    let isLoggedIn = false

    Story.find().then( (stories) => { 
        if(req.cookies.access_token) {
            isLoggedIn = true
        } 
        res.render('index.ejs', { stories, isLoggedIn })

   }) 
}

//NEW  --AUTHENTICATE!!!!!!!!!!
const sendNewStoryForm = (req, res, next) => {

let isLoggedIn = false
    
console.log(req.userId)
const userId = req.userId

if(!userId) {
    console.log('no cookie found!')
    return res.redirect('/users/login')
}
    // const token = req.cookies.access_token
    // const decodedToken = jwt.verify(token, JWT_KEY_SECRET)

    User.findById(userId)
        .then((usr) => {
            if(!usr){
                console.log('access denied, user does not exist')
                res.redirect('/users/login')
            } else {
                if(req.cookies.access_token) {
                    isLoggedIn = true
                } 
                console.log('access granted, you may create a story')
                res.render('new.ejs', { userId, isLoggedIn })

                }
            })
        

}

//SHOW 
const getStoryById = async (req, res, next) => {
     // res.send(req.params.id)
     let isLoggedIn = false


     const story = await Story.findById(req.params.id)
     if(req.cookies.access_token) {
        isLoggedIn = true
    } 
     res.render('show.ejs', { story, isLoggedIn })
}

//shows user's stories 
const getStoriesByUserId = (req, res, next) => {
    let isLoggedIn = false

    console.log('getting all stories by user ID')

    Story.find({ author: req.params.id })
        .then((stories) => {

            if(req.cookies.access_token) {
                isLoggedIn = true
            } 
            res.render('index.ejs', { stories, isLoggedIn })
        })
}

//CREATE --AUTHENTICATE!!!!!!!!!!
const createNewStory = (req, res, next) => {
    
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

}

//EDIT--AUTHENTICATE!!!!!!!!!!
const sendEditStoryForm = (req, res, next) => {

    let isLoggedIn = false

    const userId = req.userId

    Story.findById(req.params.id)
        .then((story) => {
            if(story.author.id === userId) {
                console.log('edit access aproved')

                if(req.cookies.access_token) {
                    isLoggedIn = true
                } 
                res.render('edit.ejs', { story, isLoggedIn })
            } else {
                console.log('access denied')
                res.redirect('/stories')
            }
        })
}

//UPDATE--AUTHENTICATE!!!!!!!!!!
const updateStoryById = (req, res, next) => {
   
    const userId = req.userId

    Story.findById(req.params.id)
        .then((story) => {
            if(story.author.id === userId) {
                console.log('access granted')
                const newBody = {title: req.body.title, storyText: req.body.storyText}

                Story.findByIdAndUpdate(story.id, {$set: newBody}, {new: true}, (err, updatedModel) => {
                res.redirect('/stories')
                })
            } else {
                console.log('access denied')
                res.redirect('/stories')
            }
        })
}

//DELETE--AUTHENTICATE!!!!!!!!!!
const deleteStoryById = (req, res, next) => {
  
    const userId = req.userId
    
    Story.findById(req.params.id)
        .then((story) => {
            if(story.author.id === userId) {
                console.log('you got it chief')
                Story.findByIdAndRemove(story.id, (err, data) => {
                    if(err) console.log(err)
                    res.redirect(`/stories/user/${userId}`)
                })
            } else { 
                console.log('no can do')
                res.redirect('/stories')
            }
        })
}

module.exports = { 
    getAllStories, 
    sendNewStoryForm, 
    getStoryById,
    getStoriesByUserId,
    createNewStory,
    sendEditStoryForm,
    updateStoryById,
    deleteStoryById
}