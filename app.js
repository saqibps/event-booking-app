const express = require('express')
const bodyparser = require('body-parser')
const graphqlHTTP = require('express-graphql')
const mongoose = require('mongoose')

const graphqlSchema = require('./graphql/schema/index')
const graphqlResolver = require('./graphql/resolvers/index')
 
const app = express()

app.use(bodyparser.json())


app.use('/graphql', graphqlHTTP({
    schema : graphqlSchema,
    rootValue : graphqlResolver,
    graphiql : true
})
)
const MONGO_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00-jaths.mongodb.net:27017,cluster0-shard-00-01-jaths.mongodb.net:27017,cluster0-shard-00-02-jaths.mongodb.net:27017/${process.env.MONGO_DB}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`
mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
                .then(() => { console.log("Mongo Atlas Connected"); })
                .catch(err => { console.log(err) })

app.listen(3000, () => { console.log("Server started on port 3000")})