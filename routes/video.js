const express = require('express')
const { uploadVideo, getAllvideos, getTempVideo } = require('../controllers/video.js');
const { likeController } = require('../controllers/like.js');
const { viewController } = require('../controllers/views.js');
const { likeVideoController, getAlllikeVideoController, deleteLikeVideoController } = require('../controllers/likeVideo.js');
const { watchLaterController, getAllwatchLaterController, deletewatchLaterController } = require('../controllers/watchLater.js');
const { HistoryController, getAllHistoryController, deleteHistoryController } = require('../controllers/history.js');
const upload = require('../Helpers/fileHelpers.js');
const auth = require('../middleware/auth.js');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const TempFile = require('../models/TempFiles.js')

const ffmpeg = require('fluent-ffmpeg');
const routes = express.Router();

routes.post("/uploadVideo", auth, upload.single("file"), (req, res, next) => {
    const { io } = require('../index.js');
    uploadVideo(req, res, next, io);
});

routes.post('/tempUpload', upload.single('video'), async (req, res) => {
    const videoFile = req.file;
    const colorTone = req.body.colorTone;

    if (!videoFile) {
        return res.status(400).send('No video file uploaded');
    }

    // Ensure the uploads directory exists
    const uploadsDir = 'uploads';
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    // Use original filename
    const outputFileName = `${Date.now()}_${path.basename(videoFile.originalname, path.extname(videoFile.originalname))}.mp4`;
    const outputPath = path.join(uploadsDir, outputFileName);

    const filter = getColorFilter(colorTone); 

    ffmpeg()
        .input(videoFile.path)
        .videoFilters(filter) 
        .output(outputPath)
        .on('end', async () => {
            console.log('Processing finished');

            // Check if entry already exists for the uploaded file
            let tempFile = await TempFile.findOne({ fileName: outputFileName });

            // If entry exists, update its color tones
            if (tempFile) {
                tempFile.colorTones.push(colorTone);
            } else {
                // Otherwise, create a new entry
                tempFile = new TempFile({
                    fileName: outputFileName,
                    filePath: outputPath,
                    colorTones: [colorTone]
                });
            }

            // Save data into database
            try {
                await tempFile.save();
                res.status(200).json({ processedVideo: outputPath });
            } catch (error) {
                console.error('Error saving data into database:', error.message);
                res.status(500).send('Error saving data into database');
            }
        })
        .on('error', (err) => {
            console.error(`Error during processing: ${err.message}`);
            res.status(500).send('Video processing failed');
        })
        .run();
});





function getColorFilter(colorTone) {
   switch (colorTone) {
        case 'grayscale':
            return 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3';
        case 'sepia':
            return 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131';
        case 'invert':
            return 'negate';
        case 'brightness':
            return 'eq=brightness=0.5';
        case 'contrast':
            return 'eq=contrast=2';
      default:
        return '';
    }
}
  


routes.get("/getvideos", getAllvideos);
routes.get("/tempvideos", getTempVideo);
routes.patch('/like/:id', auth, likeController)
routes.patch('/view/:id', viewController)

routes.post('/likeVideo', auth, likeVideoController)
routes.get('/getAlllikeVideo', getAlllikeVideoController)
routes.delete('/deleteLikedVideo/:videoId/:Viewer', auth, deleteLikeVideoController)

routes.post('/watchLater', auth, watchLaterController)
routes.get('/getAllwatchLater', getAllwatchLaterController)
routes.delete('/deleteWatchlater/:videoId/:Viewer', auth, deletewatchLaterController)

routes.post('/History', auth, HistoryController)
routes.get('/getAllHistory', getAllHistoryController)
routes.delete('/deleteHistory/:userId', auth, deleteHistoryController)

module.exports = routes;
