const mongoose = require('mongoose');

const commentSchema= mongoose.Schema({
    videoId:String,
    userId:String,
    commentBody:String,
    userCommented:String,
    CommentOn:{type:Date,default:Date.now}
})
module.exports= mongoose.model("Comments",commentSchema)