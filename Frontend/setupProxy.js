/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const request = require('request');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/users', (req, res) => {
    request(
        { 
            url: 'https://ec2-3-22-51-253.us-east-2.compute.amazonaws.com/users',
            headers: {
                'Authorization': process.env.REACT_APP_API_KEY, 
            },
            rejectUnauthorized: false,
        },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return res.status(500).json('error');
            }
            res.json(JSON.parse(body));
        }
    );
});
  
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));

