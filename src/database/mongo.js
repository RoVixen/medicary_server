const { MongoClient } = require("mongodb")
const {mongo} = require("../utils/envoriment")

const medicaryMongoClient=new MongoClient(mongo.url);

async function main() {
    // Use connect method to connect to the server
    await medicaryMongoClient.connect();
    console.log('Connected successfully to mongDB');
    const db = medicaryMongoClient.db(mongo.dbname);
  
    return db;
}

module.exports={
    medicaryMongoDB:main()
}