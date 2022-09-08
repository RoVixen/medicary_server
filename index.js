const express = require("express");
var { graphqlHTTP } = require('express-graphql');

const { port } = require("./src/utils/envoriment");

const { schemaPromise } = require("./src/database/graphql");
const {medicaryMongoDB}=require("./src/database/mongo")
const wss=require("./src/websocket/ws")

const cors=require("cors")

//despues de invocar el servidor websocket, configurar las
require("./src/websocket/routerinit").configureAllRoutes.then((resul)=>{
  console.log("All routes configured")
})

const app=express();

//setting cors
app.use(cors())

//set the graphql
schemaPromise
.then((schema)=>{
  app.use("/graphql",graphqlHTTP({
    graphiql:true,
    schema 
  }))
  console.log("GraphQL configured and hosted")
})

//endpoint to get images
app.use("/images",express.static("./src/images"))

//an endpoint just for redirecting to graphql screen
app.get("/",(req,res)=>{
  res.redirect("/graphql")
})

app.listen(port,()=>{
  console.log("http://localhost:"+port)
})

process.stdin.on("data",(data)=>{

  const input=data.toString().split("\r\n")[0];

  console.log("some input were: "+input)
  console.log(input)
  if(input=="a")
  console.log("you typed a")
})