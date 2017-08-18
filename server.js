var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto= require('crypto');
var Pool = require('pg').Pool;
var bodyParser = require('body-parser');

var config = {
    user:"phatakbhakti83",
    database:"phatakbhakti83",
    host:'db.imad.hasura-app.io',
    port:"5432",
    password:process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

function hash(input, salt){
    //how to create hash
    var hashed = crypto.pbkdf2Sync(input,salt, 10000,512,'sha512');
    return hashed.toString('hex');
}

app.get('/hash/:input', function(req,res){
    var hashedstring = hash(req.params.input,'this-is-some-random-string');
    res.send(hashedstring);
});

app.post('/createuser',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    //get username and password and add it to database
    var salt= crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    pool.query('INSERT INTO "Users" ("Username", "password") VALUES ($1,$2)',[username, dbString], function(err, result){
        if(err){
            res.status(500).send(err.toString());
        } else{
            res.send('User Created!!');
        }
    })
});

var pool = new Pool(config);
app.get('/test-db', function (req,res){
    //make a select request
    //return response with result
    pool.query('SELECT * from test',function(err, result){
        if(err){
            res.status(500).send(err.toString());
        } else{
            res.send(JSON.stringify(result.rows));
        }
    });
    
});

app.get('/articles/:articlename', function(req,res){
    
   pool.query('SELECT * from "Article" where title ='+"'"+req.params.articlename+"'",function(err,result){
       if (err){
           res.status(500).send(err.toString());
       }else{
           if(result.rows.length ===0){
               res.status(404).send('Article not found');
           }else{
            //  res.send(JSON.stringify(result.rows));
           
            var articledata = result.rows[0];
            req.send(JSON.stringify(articledata));
           }
       }
       
   }) ;
   
});

// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
