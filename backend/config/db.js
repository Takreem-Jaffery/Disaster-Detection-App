const mongoose = require("mongoose")

const dbConnect = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
    }
    catch(err){
        console.error("MongoDB Connection Error: ", err.message);
    }
}

module.exports = dbConnect;