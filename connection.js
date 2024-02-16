const mongoose = require("mongoose")
require("dotenv").config()
try {
    
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@cluster0.c2xzlyu.mongodb.net/chatAppMern?retryWrites=true&w=majority`)
} catch (error) {
}