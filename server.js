var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var url = 'mongodb://dannynhois-urlshortner-4739954:27017'
var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
var db;

//connect to database and open app for listening
MongoClient.connect(url, function(err, database){
    if (err) return console.log(err);
    db = database;
    app.listen(8080,function(){
        console.log("Listening on 8080");
    })
    
})

//homepage
app.get("/",function(req,res){
    res.send("Enter new html via https://urlshortner-dannynhois.c9users.io/new/URL")
})

//get new quote - use wildcard routing to account for http://
app.get("/new/*",function(req,res){
    var website = req.params[0];
    
    //url validation regex from https://gist.github.com/dperini/729294
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i
    //console.log(regex.test(website) + " - " + website);
    
    //if valid website
    if (regex.test(website)){
        
        //check to see if site exists in database
        db.collection('sites').find({'original_url':website}).toArray(function(err, results){
            if (err) throw err;
            
            //website doesn't exist
            if(results[0] === undefined || results[0].length ==0){
                
                
                //add to database
                var randURL = Math.floor(Math.random()*1000);
                var shortURL = "https://urlshortner-dannynhois.c9users.io/" + randURL;
                var data = {
                    original_url:website,
                    short_url:shortURL
                }
                
                //add url to database
                db.collection('sites').save(data,function(err,results){
                    if (err) return console.log(err);
                    
                    console.log(website + " - saved to database");
                    res.send(data);
                })
            }
            else {
                res.send(results[0]);
            }
        })
    }
    else {
        res.send("Enter valid url starting with http:// or https://");
    }
    
    
})



app.get("/:id",function(req,res){
    var shortURL = "https://urlshortner-dannynhois.c9users.io/" + req.params.id;
    
    //check to see if site exists in database
    db.collection('sites').find({'short_url':shortURL}).toArray(function(err, results){
        if (err) throw err;
        
        //website doesn't exist
        if(results[0] === undefined || results[0].length ==0){
            res.send("Link doesn't exist. Please create a new one")
        }
        //website does exist - redirect
        else{
            res.redirect(results[0]['original_url']);
        }
    })
})