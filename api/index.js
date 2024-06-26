const express = require('express');
const dotenv = require('dotenv');

const port = 8080;

dotenv.config();

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secrete = process.env.SPOTIFY_CLIENT_SECRET;
const spotify_redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
var access_token;

var app = express();

// app.use(express.static(path.join(__dirname, '../build')));

var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

app.get('/', (req, res) => {
    res.send('beep bop');
})

// get authorization code
app.get('/auth/login', (req, res) => {
    var scope = "streaming user-read-email user-read-private user-read-playback-state playlist-read-private user-modify-playback-state";
    var state = generateRandomString(16);
    var auth_query_params = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: spotify_redirect_uri,
        state: state
    });

    res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_params.toString());
});

// exchange auth code for api token
app.get('/auth/callback', (req, res) => {
    var code = req.query.code;

    var authOptions = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secrete).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            code: code,
            redirect_uri: spotify_redirect_uri,
            grant_type: 'authorization_code'
        }),
        json: true
    }

    fetch('https://accounts.spotify.com/api/token', authOptions)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            access_token = data.access_token;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.cookie('access_token', access_token);
            res.redirect("/");
        });
});

app.get('/auth/token', (req, res) => {
    console.log(access_token);
    res.json({
        access_token: access_token ? access_token : ""
    });
});

app.listen(port, () => {
    console.log(`Listening at port ${port}...`);
});