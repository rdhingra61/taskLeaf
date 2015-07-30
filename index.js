var express = require('express');
var session = require('express-session');
var app = express();
var http = require('http').Server(app);
//var bodyParser = require('body-parser');
//var io = require('socket.io').listen(http);
//var socket = require('./routes/socket');


var path = require('path'),api = require('./routes/api');
//app.get('/api/name', api.name);
app.use(express.static(path.join(__dirname, 'public')));

// Session
//app.use(session({secret: '*#*#34971539#*#*'}));
// Config

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({
  //  extended: true
//}));

//app.use(morgan('dev') );

/*Database Connection*/
var databaseUrl = "taskLeaf"; 
var collections = ["taskLeafUser"]
//var db = require("mongojs").connect(databaseUrl, collections);
app.get('/', function(error,req, res){
  console.log(error);
  res.sendfile('register.html');
});

/*Error Handling start*/

app.use(function(req, res, next){
  res.render('404', { status: 404, url: req.url });
});
app.use(function(err, req, res, next){
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.render('500', {
      status: err.status || 500
    , error: err
  });
});

/*Error Handling End*/

http.listen(3210, function(){
  console.log('listening on *:3210');
});
//routes(app);