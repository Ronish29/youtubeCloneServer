const mongoose = require('mongoose');
require('dotenv').config();

const dbConnect = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_URL,{
        });
        console.log('DB Connection Successfull');
    } catch(error){
        console.error("Connection not established",error.message);
        process.exit(1);
    }
};

module.exports = dbConnect;