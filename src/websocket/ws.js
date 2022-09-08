const WebSocketServer = require("ws").Server;
const {wskey} = require("../utils/envoriment");
const { tryParseMessage } = require("../utils/middlewares");

const wss=new WebSocketServer({
    port:4203
})

wss.on("connection",(socket,message)=>{
    const params=(new URLSearchParams(message.url.slice(1)));

    //verfica que la api key sea la correcta
    if(params.get("key")!=wskey){
        console.log("Wrong key connection closed, trying to connect with key: "+params.get("key"))
        return socket.close(3000,"wrong API key");
    }
    
    console.log(console.log("incomming connection, ip= "+message.socket.remoteAddress))
    
    //solo se autoriza 1 conneccion a la vez
    if(wss.clients.size>1){
        console.log("Closed all connections, more than one connection were made, only one connection allowed");
        wss.clients.forEach((client)=>{
            client.close(3000,"Only one connection at time allowed");
        })
    }
    
    //una forma mas comoda de enviar jsons
    //ademas de poder interceptar cada vez que se envie un mensaje
    socket.mrySend=(data)=>{
        if(typeof data == "object")
        data=JSON.stringify(data)
     
        socket.send(data);
    }
    
    socket.on("message",(data,isBinary)=>{

        const message = isBinary ? data : data.toString();
        let jsonMessage=tryParseMessage(message);
        if(!jsonMessage)
        return console.log("could not parse incomming message: "+message);

        const {command,body} = jsonMessage;
        
        //solo en forma de debug, cada vez que se reciba el comando de working, se envia 
        if(jsonMessage.mry_isGetWorking){
            console.log(wss.clients.size)

            //wss.clients.forEach((wshit,index)=>{console.log(wshit.mrySend({command:"ASDASD"}))});
            socket.send(JSON.stringify({command:"mry_sendToUpdateAllProducts"}))
        }

        if(typeof command == "string"){
            //todos los comandos empiezan con este prefijo
            if(command.slice(0,5)!=="mrys_")//s al final es de server
            return socket.mrySend({error:"Command must have the prefix 'mrys_'"})

            //reporta si el comando no existe
            if(wss.eventNames().some((name)=>name==command))
            wss.emit(command,body)
            else{
                console.log("received not recognized command: "+command)
                socket.mrySend({error:"you sent a not recognized command: "+command})
            }
        }
    })

    setTimeout(()=>{
        socket.mrySend({command:"mry_isGetWorking"})
        console.log("sent working command")
    },2000)
})

module.exports=wss;