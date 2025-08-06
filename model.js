const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const url = process.env.URL;

async function init() {
    try {
        if (!url) {
            console.log('Bad url: ',url);
            return;
        }
        await mongoose.connect(url);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
    }
}

function getUser() {
    const userSchema = new mongoose.Schema({
        userName: String,
        email: String,
        password: String,
        accessToken: String,
        date: String
    });
    return mongoose.models.User || mongoose.model('User', userSchema);
}

async function createUser(
    name,email, password,id,accessToken,
) {
    const date = new Date();
    const time = `Day: ${date.getDate()},Month: ${date.getMonth()},Year: ${date.getFullYear()}`;
    const User = getUser();
    const user = new User({
        userName: name,
        email: email,
        password: password,
        accessToken: accessToken,
        date: time
    })
    return user.save()
    .then(() => console.log("user saved",user))
    .catch(err => console.log(err));
}
module.exports = {
    createUser,
    getUser,
    init
}