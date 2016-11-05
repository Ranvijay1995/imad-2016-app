var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;
var crypto=require('crypto');
var bodyParser=require('body-parser')



var config = {
  user: 'ranvijay1995',
  database: 'ranvijay1995',
  host: 'db.imad.hasura-app.io',
  port: '5432',
  password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());




app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/profile', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'profile.html'));
});


function hash (input,salt)
{
    var hashed=crypto.pbkdf2Sync(input,salt, 10000,512, 'sha512');
    return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
}


app.get('/hash/:input', function (req, res) {
    var hashedString=hash(req.params.input,'this is some random string');
    res.send(hashedString);
});


app.post('/create-user', function (req, res) {
    
    var username=req.body.username;
    var password=req.body.password;
    
    
    var salt=crypto.randomBytes(128).tostring(hex);
    var dbstring=hash(password, salt);
    pool.query('INSERT INTO "user" (username,password) VALUES ($1 ,$2)',[username, dbString],  function (err, result){
        if (err) {
            res.status(500).send(err.toString());
        } else {
            res.send('user succesfully created:',+username);
        }
    } );
});


app.post('/login', function (req, res) {
    
    var username=req.body.username;
    var password=req.body.password;
    pool.query('SELECT *from "user" where username=$1', [username],  function (err, result){
        if (err) {
            res.status(500).send(err.toString());
        } else {
            if(result.row.length===0){
                req.send(403).send('username/password is invalid');
            }
            else{
                var dbString=result.row[0].password;
                var salt=dbString.split('$')[2];
                var hashedPassword=hash(password,salt);
                if(hashedPassword===dbString)
                {
                     res.send('user credential are correct');
                }else{
                    req.send(403).send('username/password is invalid');
                }
            }
        }
    } );
});



var pool = new Pool(config);
app.get('/test-db', function (req, res) {
   // make a select request
   // return a response with the results
   pool.query('SELECT * FROM test', function (err, result) {
      if (err) {
          res.status(500).send(err.toString());
      } else {
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




function createTemplate (data) {
    var title = data.title;
    var date = data.date;
    var heading = data.heading;
    var content = data.content;
    
    var htmlTemplate = `
    <html>
      <head>
          <title>
              ${title}
          </title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="/ui/style.css" rel="stylesheet" />
      </head> 
      <body>
          <div class="container">
              <div>
                  <a href="/">Home</a>
              </div>
              <hr/>
              <h3>
                  ${heading}
              </h3>
              <div>
                  ${date.toDateString()}
              </div>
              <div>
                ${content}
              </div>
          </div>
      </body>
    </html>
    `;
    return htmlTemplate;
}








app.get('/blog', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'blog.html'));
});

app.get('/personal', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'personal.html'));
});

app.get('/professional', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'professional.html'));
});

app.get('/article', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
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
