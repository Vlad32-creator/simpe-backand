const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, getUser } = require('./model');

function jwtCheck(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.send({ message: 'Token not found' });
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
            return res.send({ valid: true, payload });
        } catch (err) {
            console.log(err);
            return res.send({ valid: false, Error: 'Not correct token' });
        }
    } catch (err) {
        console.log(err);
        res.send(err)
    }
}

function signJWT(userName) {
    const token = jwt.sign(
        {userName},
        process.env.JWT_SECRET_TOKEN,
        { expiresIn: '7d' }
    )
    return token;
}


async function checkRegistration(req, res, next) {
    const allowed = /^[a-zA-Zа-яА-ЯёЁ0-9 _-]+$/;
    const { userName, email, password } = req.body;
    console.log("userName: ", userName);
    console.log("email: ", email);
    console.log("password: ", password);
    const User = getUser();
    if (
        !allowed.test(userName) ||
        !allowed.test(password)
    ) {
        return res.send({ Error: 'Expected only letters and numbers' });
    } if (userName.trim() === '' || email.trim() === '' || password.trim() === '') {
        return res.send({ Error: 'Fill all fields' })
    }
    const user = await User.findOne({ userName });
    if (user) {
        return res.send({ Error: 'There is already such a user' });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const token = signJWT(userName);
    console.log(token);
    await createUser(userName, email, hashPassword, token);
    res.cookie('accessToken', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.send({ success: true });
}
async function checkLogin(req, res) {
    const allowed = /^[a-zA-Zа-яА-ЯёЁ0-9 _-]+$/;
    const { email, password } = req.body;
    const User = getUser();
    if (!email || !password) {
        return res.send({ Error: 'Fill all fields' });
    } if (!allowed.test(password)) {
        return res.send({ Error: 'Unexpected symbols' });
    }
    const user = await User.findOne({ email });
    const correctPass = await bcrypt.compare(password,user.password); 
    if (!user || !correctPass) {
        return res.send({Error: `Not correct data`})
    }if (correctPass) {
        const token = signJWT();
        res.cookie('accessToken',token,{
            httpOnly: true,
            maxAge: 7*24*60*60*1000
        })
        return res.send({success:true});
    }
}
module.exports = {
    checkRegistration,
    checkLogin,
    jwtCheck
};