const express = require('express');
const mongoose = require('mongoose');
const randomstring = require('randomstring');

const app = express();

try {
    mongoose.connect('mongodb://localhost:27017/stefano?authSource=admin', {useNewUrlParser: true});
    console.log('Connected to database');
} catch (err) {
    return console.log('Could not connected to database.');
}

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/status', (req, res) => {
    res.send({
        status_code: 1,
        status_message: 'working'
    });
});

app.get('/random', (req, res) => {
    res.send({
        number: Math.floor(Math.random() * Math.floor(100)),
        string: randomstring.generate(10)
    });
});

try {
    app.listen(2345);
} catch (err) {
    return console.log('Could not initialize web server');
}

console.log('Connected');