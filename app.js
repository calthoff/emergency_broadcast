let express = require('express');

let app = express();

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html')
})

app.get('/location', function(req, res){
    console.log(req.query.long)
    console.log(req.query.lat)

})

app.listen('3000')