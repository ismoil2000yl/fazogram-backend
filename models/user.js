const mongoose = require("mongoose")
const bcyrpt = require('bcrypt')
const { username } = require("validator")

const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "To'ldirilmagan..!"]
    },
    username: {
        type: String,
        required: [true, "To'ldirilmagan..!"],
        lowercase: true,
        unique: true,
        index: true,
        // validate: [username, "Yaqroqsiz username"]
    },
    password: {
        type: String,
        required: [true, "To'ldirilmagan..!"]
    },
    picture: {
        type: String,
        required: [true, "To'ldirilmagan..!"]
    },
    newMessages: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
        default: 'Online'
    }
}, { minimize: false });

UserSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    bcyrpt.genSalt(10, function (err, salt) {
        if (err) return next(err)

        bcyrpt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next()
        })
    })
})

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

UserSchema.statics.findByCredentials = async function (username, password) {
    const user = await user.findOne({ username });
    if (!user) throw new Error("username xato...!")

    const isMatch = await bcyrpt.compare(password, user.password)
    if (!isMatch) throw new Error("parol xato...!")
    return user

}

const User = mongoose.model('User', UserSchema)

module.exports = User