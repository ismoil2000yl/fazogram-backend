const router = require("express").Router();
const User = require('../models/user')
const Post = require("../models/post")
const bcrypt = require("bcrypt")

//  Creating User
router.post('/register', async (req, res) => {
    try {
        const { username, fullname, password, picture } = req.body
        console.log(req.body);
        const user = await User.create({ username, fullname, password, picture });
        res.status(201).json(user)
    }
    catch (e) {
        let msg;
        if (e.code == 11000) {
            msg = "Bu foydalanuvchi nomi mavjud"
        }
        else {
            msg = e.message
        }
        console.log(e)
        res.status(400).json(msg)
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(401).json({ error: 'Username xato...!' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
        user.status = 'Online';
        await user.save();
        // res.json({ user });
        res.status(200).json(user);
    } else {
        res.status(401).json({ error: 'Parol xato...!' });
    }
});


router.get('/users', async (req, res) => {
    const users = await User.find();
    try {
        res.status(201).json(users)
    }
    catch (err) {
        conosle.log(err)
        res.status(400).send()
    }
})

    // router.post('/addpost', async (req, res) => {
    //     try {
    //         const { content, from, time, date, type } = req.body
    //         console.log(req.body);
    //         const post = await Post.create({ content, from, time, date, type });
    //         res.status(201).json(post)
    //     }
    //     catch (e) {
    //         console.log(e)
    //         res.status(400).json(msg)
    //     }
    // })

router.get('/getpost', async (req, res) => {
    const posts = await Post.find();
    try {
        res.status(201).json(posts)
    }
    catch (err) {
        conosle.log(err)
        res.status(400).send()
    }
})

module.exports = router