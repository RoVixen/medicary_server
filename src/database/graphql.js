const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLFloat
} = require("graphql");

const { medicaryMongoDB } = require("./mongo");
const {port} =require("../utils/envoriment")
const fse = require("fs-extra")
const me = require("mongo-escape");

const ProductType= new GraphQLObjectType({
    name: "Product",
    description:"Un producto distribuido por medica RY",
    fields:()=>({
        _id:{type:new GraphQLNonNull(GraphQLString),description:"id de la base de datos mongo"},
        id:{type:new GraphQLNonNull(GraphQLInt),description:"id de la base de datos sql"},
        name:{type:new GraphQLNonNull(GraphQLString)},
        description:{type:GraphQLString},
        price_d:{type:GraphQLFloat,description:"precio en dolares"},
        price_bs:{type:GraphQLFloat,description:"precio en bolivares"},
        stock:{type:new GraphQLNonNull(GraphQLInt)},
        reserved:{type:GraphQLInt,description:"la cantidad que ya hay reservados, este numero deveria disminuir la cantidad posible para comprar o reservar"},
        aviable:{
            type:GraphQLInt,
            description:"la cantidad que se puede comprar (stock - reserved = aviable)",
            resolve:(parent)=>{
                return parent.stock-parent.reserved;
            }
        },
        imgurl:{
            type:GraphQLString,
            description:"url de la imagen del producto",
            resolve:(parent)=>{
                if(fse.pathExistsSync("./src/images/products/"+parent.id+".png"))
                return "http://localhost:"+port+"/images/products/"+parent.id+".png"

                return "http://localhost:"+port+"/images/products/default.png"
            }
        }
    })    
})

const ClientType= new GraphQLObjectType({
    name: "Client",
    description:"Cliente registrado de medica RY",
    fields:()=>({
        id:{type:new GraphQLNonNull(GraphQLInt),description:"Identificator"},
        name:{type:new GraphQLNonNull(GraphQLString)},
    })
})

const schemaPromise=medicaryMongoDB
.then(db=>{

    const productsCollection=db.collection("products")

    const RootQueryType = new GraphQLObjectType({
        name:"QueryPractice",
        description:"practicing root query",
        fields:()=>({
            products:{
                type:new GraphQLList(ProductType),
                description:"Una lista de todos los productos registrados",
                args:{
                    search:{type:GraphQLString,description:"buscar por nombre"},
                    limit:{type:GraphQLInt,description:"limite de resultados"},
                    offset:{type:GraphQLInt,description:"offset de resultados"},
                    order:{type:GraphQLString,description:"orden de resultados"},
                    orderby:{type:GraphQLString,description:"campo por el que ordenar"}
                },
                resolve:(parent,{search,limit})=>{

                    let options={}
                    if(typeof limit === "number")
                    options.limit=Math.floor(limit)

                    if(typeof search === "string")
                        return productsCollection.find({name:{$regex:me.escape(search),$options:"i"}},options).toArray()

                    return productsCollection.find({},options).toArray()
                }
            },
            product:{
                type:ProductType,
                description:"Producto de medica RY",
                args:{
                    id:{type:GraphQLInt}
                },
                resolve:(parent,{id})=>{
                    return productsCollection.findOne({id})
                }
            },
            client:{
                type:ClientType,
                description:"Cliente de medica RY, solo puedes ingresar este query con el JWT de la sesion",
                args:{
                    jwt:{type:GraphQLString}
                },
                resolve:(parent,{jwt})=>{
                    return null
                }
            }
        })
    })
    
    return new GraphQLSchema({
        query:RootQueryType
    })
})

module.exports={
    schemaPromise
};