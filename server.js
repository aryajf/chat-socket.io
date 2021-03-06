const app  = require('express')()
const http = require('http').Server(app)
const io   = require('socket.io')(http)

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html')
})

var users = {}
var usernames = []

io.on('connection', function(socket){

    socket.broadcast.emit('newMessage', 'someone connected')

    // Ketika ada user yang daftar
    socket.on('registerUser', function(username){
        if(usernames.indexOf(username) != -1){
            socket.emit('registerRespond', false)
        }else{
            users[socket.id] = username
            usernames.push(username)
            socket.emit('registerRespond', true)
            io.emit('addOnlineUsers', usernames)
        }
    })

    // Terima jika ada message baru
    socket.on('newMessage', function(msg){
        // Ngirim ke index.html
        io.emit('newMessage', msg)
        console.log('New message from ' + msg)
    })

    // Sedang mengetik
    socket.on('newTyping', function(msg){
        io.emit('newTyping', msg)
    })
    
    // Terima jika user disconnect
    socket.on('disconnect', function(msg){
        socket.broadcast.emit('newMessage', 'someone left the chat')

        let index = usernames.indexOf(users[socket.id])
        usernames.splice(index, 1)

        delete users[socket.id]

        io.emit('addOnlineUsers', usernames)
    })
})

http.listen(3000, function(){
    console.log('listenin on 3000');
})