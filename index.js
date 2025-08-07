const cors = require('cors');
const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const {checkLogin,checkRegistration,jwtCheck} = require('./midelware');
const {init} = require('./model');
const app = express();
const PORT = process.env.PORT || 5000;
const origin = ['http://localhost:5173','https://vlad32-creator.github.io/WebParser/'];

init();
app.use(cors({
    origin: origin,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.post('/registration', checkRegistration);

app.get('/checkToken', jwtCheck);

app.post('/login', checkLogin);

app.listen(PORT,() => {
    console.log(`Server wor on http://localhost:${PORT}`);
})