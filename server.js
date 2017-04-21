var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var url = 'mongodb://dannynhois-urlshortner-4739954:27017'
var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
var db;

MongoClient.connect(url, function(err, database){
    if (err) return console.log(err);
    db = database;
    app.listen(8080,function(){
        console.log("Listening on 8080");
    })
    
})

app.get("/",function(req,res){
    db.collection('quotes').find().toArray(function(err, results){
        if (err) return console.log(err);
        res.render('index.ejs',{quotes: results});
    });
    
    
})

app.post("/quotes",function(req,res){
    db.collection('quotes').save(req.body, function(err, result){
        if (err) return console.log(err);
        
        console.log("saved to database");
        res.redirect('/');
    })
})