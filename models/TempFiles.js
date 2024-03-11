const mongoose = require('mongoose');


const tempSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    colorTones: [String],
},{
    timestamps:true
}
)


module.exports = mongoose.model("TempFile", tempSchema);