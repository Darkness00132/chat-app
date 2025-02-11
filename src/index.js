const express = require('express')
const {engine} = require('express-handlebars')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const filter = require('leo-profanity')
const {generateMessages} = require('./utils/messages.js')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))

app.get('/',(req,res)=> {
    res.send()
})

app.set((req,res)=>{
    res.status(404).send('<h1>Page not found</h1>')
})

io.on('connection',(socket)=>{
    
    socket.on('join',({username , room}, cb) =>{

        const {error , user } = addUser({
            id:socket.id,
            username,
            room
        })

        if(error) {
            return cb(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessages('welcome!','system'))
        socket.broadcast.to(user.room).emit('message',generateMessages(`${user.username} has joined`,'system'))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersInRoom(user.room)
        })
        cb()
    })

    socket.on('sendMessage',(message,cb)=>{
        if(filter.check(message.text)) {
            return cb('profanity is not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessages(message,user.username))
        cb()
    })

    socket.on('sendLocation',(message,cb)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateMessages(message,user.username))
        cb()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket)

        if(user) {
            io.to(user.room).emit('message',generateMessages(user.username +' has left','system'))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(port,()=>{
    console.log('server is running')
})