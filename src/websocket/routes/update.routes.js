const {medicaryMongoDB} = require("../../database/mongo");
const wss = require("../ws");

/**
 * 
 * @param {object} base el objeto a ser modificado, que debe adaptarse al modelo, las entradas no definidas no se contaran
 * @param {Array<string>} model una lista que representan las entradas que estan autorizadas, el resto se eliminaran, puede dejarse nulo para solo borrar las entradas undefined
 * @returns {object}
 */
function useOnlyDefinedEntriesByModel(base,model){
    
    if(typeof base!="object")
    return;
    
    if(model?.constructor?.name!="Array")
    model=false

    let toReturn={}

    return Object.entries(base).reduce((prev,[key,value],index)=>{

        if(value===undefined)
        return prev

        if(model && model.indexOf(key)===-1)
        return prev

        prev[key]=value;
        return prev;
        
    },{})
}

module.exports={
    configUpdateRoutes:async ()=>await medicaryMongoDB.then((db)=>{
        
        console.log("update.routes.js connected to mongo and running, adding update command listener")
        
        //recive la informacion de solamente 1 cliente y la guarda
        //en la base de datos
        wss.on("mrys_updateProduct",({product})=>{

            if(typeof product != "object" || !product.id)
            return 
            
            const productsCluster=db.collection("products");

            //solo estos indexes estan autorizados
            let toUse=useOnlyDefinedEntriesByModel(product,[
                "id",
                "name",
                "description",
                "price_d",
                "price_bs",
                "stock",
                "reserved"
            ])

            //actualiza
            productsCluster.updateOne({id:product.id},{$set:toUse})
            .then((result)=>{
                //si no se actualizo nada, agrega
                if(result.matchedCount==0 && result.modifiedCount==0)
                productsCluster.insertOne(toUse)
            })
        })

        /*
        wss.on("mrys_updateManyProducts",({product})=>{
            
            const productsCluster=db.collection("products");
        })
        */

        wss.on("mrys_updateClient",({client})=>{
            
            const clientsCluster=db.collection("clients");

            let toUse=useOnlyDefinedEntriesByModel(client,[ 'id', 'client_code', 'name', 'ci', 'credit_d', 'reserved' ]);

            clientsCluster.updateOne({id:client.id},{$set:toUse})
            .then((result)=>{
                if(result.matchedCount==0 && result.modifiedCount==0)
                clientsCluster.insertOne(toUse)
            })
        })
    })
}