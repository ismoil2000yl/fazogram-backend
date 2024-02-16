const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
    content: String,
    from: Object,
    socketid: String,
    time: String,
    date: String,
    type: String
})

const Post = mongoose.model("Post", PostSchema)

module.exports = Post
