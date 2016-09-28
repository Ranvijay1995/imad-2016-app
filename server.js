var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

var articleOne={
    title:'Article one | Kumar Ranvijay',
    heading:'Article one',
    date:'28 sept 2016',
    content:`
                <p>
                    this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article.
                </p>
                <p>
                        this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article.
                </p>
                <p>
                        this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article. this is the content for first article.
                </p>`
};


function createTemplate(data){
    var title=data.title;
    var heading=data.heading;
    var date=data.date;
    var content=data.content;
    var htmlTemplate=`
        <html>
            <head>
                <title>
                    {title}
                </title>
            <meta name="veiwport" content="width=device-width, intial-scale=1"/>
            <link href="/ui/style.css" rel="stylesheet" />
            </head>
            <body>
                <div>
                     <a href="/">Home</a>
            
                </div>
                <div class="container">
                        <h1>
                           ${heading}
                        </h1>
                        <hr/>
                        <div>
                             ${date}
                        </div>
            
                        <div>
                           ${content}
                        </div>
                 </div>
            </body>
        </html>
            
            `
            ;
    return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/article-one', function (req, res) {
  res.send(createTemplate(articleOne));
});

app.get('/article-two', function (req, res) {
  res.send('article two requested');
});

app.get('/article-three', function (req, res) {
  res.send('article three requested');
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
