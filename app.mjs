import express from 'express';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from "firebase/database";
import 'dotenv/config'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import '@vonage/server-sdk'


let app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId:  process.env.APP_ID
};

const vonage = new Vonage({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    applicationId: process.env.APPLICATION_ID,
    privateKey: process.env.PRIVATE_KEY
})

initializeApp(firebaseConfig);

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

app.get('/send/alert', function(req, res){
    console.log(req.query.long)
    console.log(req.query.lat)
    vonage.channel.send(
        { "type": "sms", "number": TO_NUMBER },
        { "type": "sms", "number": FROM_NUMBER },
        {
            "content": {
                "type": "text",
                "text": "This is an SMS text message sent using the Messages API"
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

})

app.listen('3000')