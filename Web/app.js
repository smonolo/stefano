const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    console.log('Request received');

    if (req.method !== 'GET') return res.send({message: 'Invalid request', code: 0});

    try {
        res.send({status: 'Working', code: 1});
    } catch (err) {
        res.send({status: 'Not working', code: 0});
    }
});

try {
    app.listen(2345);
} catch (err) {
    return console.log('Could not initialize web server');
}

console.log('Connected');