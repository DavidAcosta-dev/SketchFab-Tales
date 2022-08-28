const mongoose = require('mongoose')

//create story Schema blueprint
const storySchema = mongoose.Schema({
    title: { type: String, required: true }, 
    storyText: { type: String, required: true },
    // thumbnail: { type: String, required: true}, 
    image: {type: String, required: true }, 
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
})

storySchema.pre('findOne', function (next) {
    this.populate('author')
    next()
})

storySchema.pre('find', function (next) {
    this.populate('author')
    next()
})

const Story = mongoose.model('Story', storySchema, 'stories')

module.exports = { Story }


