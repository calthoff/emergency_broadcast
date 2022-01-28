require('dotenv/config')
require('mongodb')
const express = require('express')
const Vonage = require('@vonage/server-sdk')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

let app = express();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://coryalthoff:rKr3SG9d9hqLnLVB@cluster0.uostk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
const contactsSchema = new mongoose.Schema({
    name: String,
    number: Number
});
const Contacts = mongoose.model('Contacts', contactsSchema);

const vonage = new Vonage({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    applicationId: process.env.APPLICATION_ID,
    privateKey: process.env.PRIVATE_KEY
})

app.get('/', function(req, res){
    res.sendFile('index.html')
})

app.post('/contacts',  function (req, res) {
    const contact = new Contacts({ name: req.body.name});
    contact.save();
    res.redirect('/')
})

app.get('/contacts', function(req, res){
    Contacts.find({}, function(err, contacts){
        if(err){
            console.log(err);
        }
        else {
            res.json(contacts);
        }
    });
})

app.post('/alert', function(req, res){
    let long = req.body['coordinates']['long']
    let lat = req.body['coordinates']['lat']
    let contacts = req.body['contacts']
    for (let i = 0; i <= contacts.length; i++) {
        vonage.channel.send(
            { "type": "sms", "number": contacts[i].number},
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

app.listen(process.env.PORT)