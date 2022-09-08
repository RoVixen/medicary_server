require("dotenv").config();

module.exports={
    wskey:process.env.WSKEY,
    port:process.env.PORT,
    mongo:{
        url:process.env.MONGO_URL,
        dbname:process.env.MONGO_DBNAME
    }
}