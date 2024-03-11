const mongoose = require('mongoose');

const likedVideoSchema= mongoose.Schema({
    videoId: {type:String,require:true},
    Viewer: {type:String,require:true},
    LikedOn:{type:Date,default: Date.now}
})

module.exports= mongoose.model('LikedVideo',likedVideoSchema)