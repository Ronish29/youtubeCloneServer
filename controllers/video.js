const TempFiles = require("../models/TempFiles.js");
const videoFiles = require( "../models/videoFiles.js");
const ffmpeg = require('fluent-ffmpeg');




exports.uploadVideo = async (req, res, next,io) => {

  
  if (!req.file) {
    return res.status(404).json({ message: "Please upload a '.mp4' video file only" });
  }

  try {
    const currentDate = new Date().toISOString().replace(/:/g, "-") + "-" ;
    const qualities = [
      { name: '1080p', width: 1920, height: 1080 },
      { name: '720p', width: 1280, height: 720 },
      { name: '480p', width: 854, height: 480 },
      { name: '360p', width: 560, height: 320 }
    ];


    for (const quality of qualities) {
      const outputPath = `uploads/${currentDate}${req.file.originalname.split('.')[0]}_${quality.name}.mp4`;

      await new Promise((resolve, reject) => {
        ffmpeg(req.file.path)
          .output(outputPath)
          .videoCodec('libx264')
          .size(`${quality.width}x${quality.height}`)
          .on('end', () => {
            console.log(`Transcoding for ${quality.name} finished`);
            resolve();
          })
          .on('error', err => {
            console.error('Error transcoding:', err);
            reject(err);
          })
          .run();
      });

      // Save video information to MongoDB
      const existingVideo = await videoFiles.findOne({ fileName: req.file.originalname });
      if (existingVideo) {
        existingVideo.qualities.push(quality.name);
        await existingVideo.save();
      } else {
        console.log(req.body.chanel);
        const newVideo = new videoFiles({
          videoTitle: req.body.title,
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileType: req.file ? req.file.mimetype : req.body.selectedVideo.mimetype,
          fileSize: req.file ? req.file.size : req.body.selectedVideo.size,
          videoChanel: req.body.chanel,
          Uploder: req.body.Uploder,
          restrictedToView: req.body.restrictedToView,
          restrictedComments: req.body.restrictedComments,
          qualities: [quality.name],
          timeStamp: req.body.timestamps.map((time, index) => ({ time, title: req.body.titles[index] }))
        });
        await newVideo.save();

        
      }
    }
    const eventData = { title: req.body.title, uploder: req.body.Uploder };
    console.log("Data sent in videoUploaded event:", eventData); 
    io.emit('videoUploaded', eventData);

    setTimeout(async () => {
      try {
        // Find and delete documents created before 20 seconds
        const twentySecondsAgo = new Date(Date.now() - 20 * 1000);
        await TempFiles.deleteMany({ createdAt: { $lt: twentySecondsAgo } });
  
        console.log("Entries older than 20 seconds deleted from database.");
      } catch (error) {
        console.error("Error deleting entries from database:", error);
      }
    }, 20 * 1000);
  
  
    res.status(200).send("File uploaded successfully");
  } catch (error) {
    console.error('Error:', error);
    res.status(400).send(error.message);
  }
};
exports.getAllvideos= async (req, res)=>{
  try {
    const files= await videoFiles.find();
    res.status(200).send(files)
  } catch (error) {
    res.status(404).send(error.message)
  }
}

exports.getTempVideo = async (req, res) => {
  try {
    const tempFiles = await TempFiles.find();
    res.status(200).send(tempFiles);
  } catch (error) {
    res.status(404).send(error.message)
  }
}