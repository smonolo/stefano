const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.send({code: 1});
});

try {
    app.listen(2345);
} catch (err) {
    return console.log('Could not initialize web server');
}

console.log('Connected');