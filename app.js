const express = require('express')
const bodyparser = require('body-parser')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Event = require('./models/event')
const User = require('./models/user')
 
const app = express()

app.use(bodyparser.json())

app.use('/graphql', graphqlHTTP({
    schema : buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }
        
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events : [Event!]!

        }
        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema  {
            query : RootQuery
            mutation : RootMutation
        }
    `),
    rootValue : {
        events : () => {
            return Event.find()
                        .then(events => {
                            return events.map(event => {
                                return { ...event._doc }
                            })
                        })
                        .catch(err => { console.log(err); })
        },
        createEvent: (args) => {
            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: '5def45f217f85d491ebacc0a'
            })
            let createdEvent
            return event.save()
            .then(result => {
                createdEvent = { ...result._doc }
                return User.findById('5def45f217f85d491ebacc0a')
            })
            .then(user => {
                if (!user) {
                    throw new Error('User not Found')
                }
                user.createdEvents.push(event)
                return user.save()
                .then(result => {
                    return createdEvent
                })
            })
            .catch(err => { 
                console.log("err") 
                throw err
            })
        },
        createUser: args => {
            return User.findOne({ email: args.userInput.email }).then(user => {
                if(user) { 
                    throw new Error('User with this email already Exist.') 
                }

                return bcrypt.hash(args.userInput.password, 12)
            })
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                })
                return user.save()
            })
            .then(result => {
                return { ...result._doc, password: null }
            })
            .catch(error => { 
                throw error
             })
        }
    },
    graphiql : true
})
)
const MONGO_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00-jaths.mongodb.net:27017,cluster0-shard-00-01-jaths.mongodb.net:27017,cluster0-shard-00-02-jaths.mongodb.net:27017/${process.env.MONGO_DB}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`
mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
                .then(() => { console.log("Mongo Atlas Connected"); })
                .catch(err => { console.log(err) })

app.listen(3000, () => { console.log("Server started on port 3000")})