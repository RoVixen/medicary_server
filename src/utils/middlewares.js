module.exports={
    tryParseMessage:(message)=>{
       try {
          return JSON.parse(message);
       } catch (error) {
          console.log("Tried to parse invalid string: "+message)
          console.log(error)
          return null;
       }
    }
}