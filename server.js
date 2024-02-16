const express = require("express");
const router = require("express").Router();
const app = express();
const userRoutes = require('./routes/userRoutes')
const User = require("./models/user")
const Message = require("./models/message")
const rooms = ["fazogram-chats"]
const cors = require("cors");
const Post = require("./models/post")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

app.use('/users', userRoutes)
require('./connection')

const server = require('http').createServer(app);
const PORT = 5001;
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
})

app.delete("/logout", async (req, res) => {
    try {
        const { _id, newMessages } = req.body;
        const user = await User.findById(_id);
        user.status = "Offline";
        user.newMessages = newMessages;
        await user.save();
        const members = await User.find();
        socket.broadcast.emit('new-user', members);
        res.status(200).send();
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

app.get('/rooms', (req, res) => {
    res.json(rooms)
})

const getLastMessagesFromRoom = async (room) => {
    let roomMessages = await Message.aggregate([
        { $match: { to: room } },
        { $group: { _id: '$date', messagesByDate: { $push: '$$ROOT' } } }
    ])

    return roomMessages
}

const sortRoomMessagesByDate = (messages) => {
    return messages.sort(function (a, b) {
        let date1 = a._id.split('/');
        let date2 = b._id.split('/');

        date1 = date1[2] + date1[0] + date1[1];
        date2 = date2[2] + date2[0] + date2[1];

        return date1 < date2 ? -1 : 1

    })
}

io.on("connection", (socket) => {

    socket.on('new-user', async () => {
        const members = await User.find();
        io.emit('new-user', members)
    })

    // socket.on('join-room', async (room) => {
    //     socket.join(room)
    //     let roomMessages = await getLastMessagesFromRoom(room)
    //     roomMessages = sortRoomMessagesByDate(roomMessages)
    //     socket.emit('room-messages', roomMessages)
    // })

    socket.on('join-room', async (newRoom, previousRoom) => {
        socket.join(newRoom)
        socket.leave(previousRoom)
        let roomMessages = await getLastMessagesFromRoom(newRoom)
        roomMessages = sortRoomMessagesByDate(roomMessages)
        socket.emit('room-messages', roomMessages)
    })

    socket.on('message-room', async (room, content, sender, time, date, picture) => {

        try {
            const newMessage = await Message.create({ content, from: sender, time, date, to: room, picture });

            let roomMessages = await getLastMessagesFromRoom(room);
            roomMessages = sortRoomMessagesByDate(roomMessages);
            io.to(room).emit('room-messages', roomMessages);

            socket.broadcast.emit('notifications', room)
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    })

    socket.on('add-post', async (content, from, time, date, type) => {

        try {
            const newPost = await Post.create({ content, from, time, date, type });

        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    })

    socket.on('get_data', async () => {
        try {
            const data = await Post.find();
            io.emit('send_data', data);
        } catch (error) {
            console.error('Xatolik yuzaga keldi:', error.message);
        }
    });

    socket.on('get_user', async (username) => {
        try {
            const userData = await User.findOne({ username: username });
            io.emit('send_user', userData);
        } catch (error) {
            console.error('Xatolik yuzaga keldi:', error.message);
        }
    });

})

server.listen(PORT, () => {
    console.log('Backend is running', PORT)
})