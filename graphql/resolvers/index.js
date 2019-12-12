const Event = require('../../models/event')
const User = require('../../models/user')
const Booking =  require('../../models/booking')
const bcrypt = require('bcryptjs')


const user = userId => {
    return User.findById(userId)
        .then(user => {
            return {
                ...user._doc,
                createdEvents: events.bind(this, user.createdEvents)
            }
        })
        .catch(err => {
            throw err
        })
}

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId)
        return {
            ...event._doc,
            creator : user.bind(this, event.creator)
        }
    }catch(err) {
        throw err
    }
}

const events = eventIds => {
    return Event.find({_id : {$in: eventIds}})
            .then(events => {
                return events.map(event => {
                    return {
                        ...event._doc,
                        date: new Date(event.date).toISOString(),
                        creator: user.bind(this, event.creator)
                    }
                })
            })
            .catch(err => {
                throw err
            })
}


module.exports = {
    events : () => {
        return Event.find()
                    .then(events => {
                        return events.map(event => {
                            return { ...event._doc,
                                    date: new Date(event.date).toISOString(),
                                    creator: user.bind(this, event._doc.creator) 
                                }
                        })
                    })
                    .catch(err => { console.log(err); })
    },
    bookings: async () => {
        try{
            const bookings = await Booking.find()
            return bookings.map(booking => {
                return {
                    ...booking._doc,
                    user: user.bind(this, booking.user),
                    event: singleEvent.bind(this, booking.event),
                    createdAt: new Date(booking.createdAt).toISOString(),
                    updatedAt: new Date(booking.updatedAt).toISOString()
                }
            })
        } catch(err) {
            throw err
        }
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
        return event
        .save()
        .then(result => {
            createdEvent = { 
                ...result._doc,
                date: new Date(event.date).toISOString(),
                creator: user.bind(this, result.creator) 
            }
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
    },
    bookEvent: async args => {
        try{
            const fetchedEvent = await Event.findOne({_id: args.eventId})
            const booking = new Booking({
                user : '5def45f217f85d491ebacc0a',
                event: fetchedEvent
            })
            const result = await booking.save()
            return {
                ...result._doc,
                _id: result.id,
                user: user.bind(this, booking.user),
                event: singleEvent.bind(this, booking.event),
                createdAt: new Date(result.createdAt).toISOString(),
                updatedAt: new Date(result.updatedAt).toISOString()

            }
        }catch(err) {
            throw err
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event')
            const event = {
                ...booking.event._doc,
                creator: user.bind(this, booking.event.creator)
            }
            await Booking.deleteOne({_id : args.bookingId})
            return event
        }catch(err) {
            throw err
        }
    }
}