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
   console.log('GIVE ME BACK MY GNOME')
   Story.find().then( (stories) => {
       res.render('index.ejs', { stories })
   }) 
}

//NEW
const sendNewStoryForm = (req, res, next) => {

if(!req.cookies.access_token) {
    console.log('no cookie found!')
    return res.redirect('/users/login')
}
    const token = req.cookies.access_token
    const decodedToken = jwt.verify(token, JWT_KEY_SECRET)

    User.findById(decodedToken.userId)
        .then((usr) => {
            if(!usr){
                console.log('access denied')
                res.redirect('/users/login')
            } else {
                console.log('access granted')
                res.render('new.ejs')

                }
            })
        

}

//SHOW 
const getStoryById = async (req, res, next) => {
     // res.send(req.params.id)
     const story = await Story.findById(req.params.id)
     res.render('show.ejs', { story })
}

//shows user's stories 
const getStoriesByUserId = (req, res, next) => {
    console.log('getting all stories by user ID')

    Story.find({ author: req.params.id })
        .then((stories) => {
            res.render('index.ejs', { stories })
        })
}

//CREATE
const createNewStory = (req, res, next) => {
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
}

//EDIT
const sendEditStoryForm = (req, res, next) => {
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
}

//UPDATE
const updateStoryById = (req, res, next) => {
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
}

//DELETE
const deleteStoryById = (req, res, next) => {
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