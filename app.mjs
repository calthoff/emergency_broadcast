import express from 'express';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from "firebase/database";
import 'dotenv/config'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const Vonage = require('@vonage/server-sdk')
var bodyParser = require('body-parser')

let app = express();
app.use( bodyParser.json() );

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

const vonage = new Vonage({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    applicationId: process.env.APPLICATION_ID,
    privateKey: process.env.PRIVATE_KEY
})

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html')
})

app.post('/create/contact', async function (req, res) {
    set(ref(getDatabase(), 'users/' + req.query.name), {
        number: req.query.number,
    });
    res.sendStatus(200)
})

app.get('/get/contacts', function(req, res){
    const db = getDatabase();
    onValue(ref(db, 'users/'), (snapshot) => {
        const data = snapshot.val();
        res.json(data)
    });
})

app.post('/send/alert', function(req, res){
    let long = req.body['coordinates']['long']
    let lat = req.body['coordinates']['lat']
    let contacts = req.body['contacts']
    for(const property in contacts){
        vonage.channel.send(
            { "type": "sms", "number": contacts[property]['number']},
            { "type": "sms", "number": process.env.FROM_NUMBER},
            {
                "content": {
                    "type": "text",
                    "text": `SOS! Your friend is in an emergency! Their latitude is ${lat} and` +
                        ` their longitude is ${long}!`
                }
            },
            (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(data.message_uuid);
                }
            }
        );
    }
})

app.listen('3000')