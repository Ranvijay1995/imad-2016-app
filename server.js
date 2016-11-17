var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user: "ranvijay1995",
    database: "ranvijay1995",
    host: "db.imad.hasura-app.io",
    port: "5432",
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret:"someRandomSecretValue",
    cookie:{ maxAge:1000*60*60*24*30}
})); 

function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    
    var htmlTemplate = `
    <!doctype html>
    <html>
    <head>
        <link href="/ui/style.css" rel="stylesheet" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta charset="utf-8" name="viewport" content="width=device-width,initial-scale=1">
        <!-- Latest compiled and minified CSS -->
        <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">

        <!-- jQuery library -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>

        <!-- Latest compiled JavaScript -->
        <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>

        <title>${title}</title>
        <style>
            body {
                background-color: #e6b3ff;
                margin-left: 5px;
                margin-top: 0px;
                }
            p#demo {
                margin-left: 105px;
                color: green;
                   }
        </style>
    </head>
    <body>
        <div class="container">
        <nav class="navbar navbar-inverse">
            <div class="container-fluid">
                <ul class="nav navbar-nav" style="background-color:  #990033" >
                <li><a href="/">  Home  </a></li>
                <li><a href="/profile">  My Profile  </a></li>
                <li><a href="/blog">  My Blog  </a></li>
                <li><a href="/contacts">  Contacts  </a></li>
                </ul>
                <ul class="nav navbar-nav navbar-right">
                <li><a href="sign_up"><span class="glyphicon glyphicon-user"></span>  Sign Up </a></li>
                <li><a href="/login_page"><span class="glyphicon glyphicon-log-in"></span>  Login </a></li>
                </ul>
            </div>
        </nav>
        </div>
        <h3 style="font-size =100% ;font-family:lucida calligraphy; text-align: center;">${heading}</h3>
        <div class="article">
            <hr>
            <br>
            ${content}
            <hr>
        </div>
    </body>
    </html>
    `;
    return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input,salt){
    //How do we create a hash?
    var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
    
    //"password-this-is-some-random-string"->eljhfsefhasejkn
    //"password"->"password-salt"-> <hash> -> <hash>  iterations done 10000 times
}

app.get('/hash/:input',function(req,res){
    var hashedString=hash(req.params.input,'this-is-some-random-string');
    res.send(hashedString);
});

app.post('/create-user',function(req,res){
    //username,password
    //{"username":"ranvijay","password":"password"}
    //JSON
    var username=req.body.username;
    var password=req.body.password;
    
    var salt=crypto.randomBytes(128).toString('hex');
    var dbString=hash(password,salt);
    pool.query('INSERT INTO "user" (username,password) VALUES($1,$2)',[username,dbString],function(err,result){
         if(err){
           res.status(500).send(err.toString());
       }else{
           res.send("User Sucessfully Created "+username);
       }
    });
});

app.post('/login',function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    
    pool.query('SELECT * FROM "user" WHERE username=$1',[username],function(err,result){
         if(err){
           res.status(500).send(err.toString());
       }else{
           if(result.rows.length===0){
               res.send(403).send("Username/Password is invalid");
           }else{
               //match the password
               var dbString=result.rows[0].password;
               var salt=dbString.split('$')[2];
               var hashedPassword=hash(password,salt);//Creating a hash based on the password submitted and the original salt
               if(hashedPassword===dbString){
                   
                      //Set a session
                     req.session.auth={userId:result.rows[0].id};
                      //set a cookie with a session id
                      //internally on the server side,it maps the session id to an object
                      //{auth:{userId}}
                      
                    res.send("Credentials are correct!");
               }else{
                    res.send(403).send("Username/Password is invalid");
               }
           }
       }
    });
});

app.get('/check-login',function(req,res){
    if(req.session && req.session.auth && req.session.auth.userId) {
        res.send("You are Logged In "+req.session.auth.userId.toString());
    }else{
        res.send("You are Not Logged In");
    }
}); 

app.get('/logout',function(req,res){
    delete req.session.auth;
    res.send('Logged Out');
});


var pool = new Pool(config);
app.get('/test-db',function(req,res){
   //make a select response
   ////return a response with results
   pool.query("SELECT * FROM test",function(err,result){
       if(err){
           res.status(500).send(err.toString());
       }else{
           res.send(JSON.stringify(result.rows));
       }
       
   });
});



app.get('/articles/:articleName', function (req, res) {
  // SELECT * FROM article WHERE title = '\'; DELETE WHERE a = \'asdf'
  pool.query("SELECT * FROM article WHERE title = '"+req.params.articleName+"'", function (err, result) {
    if (err) {
        res.status(500).send(err.toString());
    } else {
        if (result.rows.length === 0) {
            res.status(404).send('Article not found');
        } else {
            var articleData = result.rows[0];
            res.send(createTemplate(articleData));
        }
    }
  });
});

app.get('/login_page', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'login_page.html'));
});

app.get('/sign_up', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui','sign_up.html'));
});

app.get('/contacts', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'contacts.html'));
});

app.get('/blog', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'blog.html'));
});

app.get('/profile', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'profile.html'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});