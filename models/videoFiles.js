const mongoose = require('mongoose');

const videoFileSchema = new mongoose.Schema(
  {
    videoTitle: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    qualities: [String],
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: String,
      required: true,
    },
    videoChanel: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    timeStamp : [
      {
        time:{
          type: String,
        },
        title: {
          type: String
        }
      }
    ],
    Like: {
      type: Number,
      default: 0,
    },
    Views: {
      type: Number,
      default: 0,
    },
    Uploder: {
      type: String,
    },
    restrictedToView: {
      type: Boolean,
      default : false
    },
    restrictedComments: {
      type : Boolean,
      default : false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports= mongoose.model("VideoFiles",videoFileSchema);
