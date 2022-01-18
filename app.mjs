import express from 'express';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from "firebase/database";
import 'dotenv/config'


let app = express();

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId:  process.env.APP_ID
};

initializeApp(firebaseConfig);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html')
})

app.post('/create/contact', async function (req, res) {
    const database = getDatabase();
    set(ref(database, 'users/' + req.query.name), {
        number: req.query.number,
    });
    res.sendStatus(200)
})

app.get('/location', function(req, res){
    console.log(req.query.long)
    console.log(req.query.lat)

})

app.listen('3000')