const Event = require('../../models/event')
const User = require('../../models/user')
const {dateToString} = require('../../helpers/date')
const { transformEvent } = require('./merge')

module.exports = {
    events : async () => {
        try{
            const events = await Event.find()
                        return events.map(event => {
                            return transformEvent(event)
                        })
        }catch (err) {
            throw err
        }
    },
    createEvent: async (args) => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: '5def45f217f85d491ebacc0a'
        })
        let createdEvent
        try {
        const result = await event.save()
            createdEvent = transformEvent(result)
            const creator = await User.findById('5def45f217f85d491ebacc0a')
            if (!creator) {
                throw new Error('User not Found')
            }
            creator.createdEvents.push(event)
            await creator.save()
                return createdEvent
        } catch(err) { 
            console.log("err") 
            throw err
        }
    },
    
}