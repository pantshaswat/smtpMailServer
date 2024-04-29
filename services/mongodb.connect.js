const mongoose = require('mongoose');
require('dotenv').config();
async function connectMongoDb(){
    
    const MONGODB_URI =
      process.env.MONGOURI;
    try {
      mongoose.connect(MONGODB_URI, {
       
      });
      console.log("Database connected successfully");
    } catch (error) {
      console.log(error);
      throw error;
    }
}
module.exports = connectMongoDb;