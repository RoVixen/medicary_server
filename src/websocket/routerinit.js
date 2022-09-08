const { configUpdateRoutes } = require("./routes/update.routes");

module.exports={
    configureAllRoutes:Promise.all([
        configUpdateRoutes()
    ])
}