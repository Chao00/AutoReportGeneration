var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var winston = require('./config/winston');
var morgan = require('morgan');
var policyFailureReport = require('./routes/policyFailure');

var missingProduct = require('./routes/missingProduct');
var notFound = require('./routes/notFound');
var about = require('./routes/about');
var errorGrouping = require("./routes/errorGrouping");
var retry = require("./routes/retryFailed");


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Body Parser Middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('combined', { stream: winston.stream }));
app.use('/', policyFailureReport);
app.use('/missingProduct',missingProduct);
app.use('/about',about);
app.use("/errorGrouping",errorGrouping);
app.use("/retryFailed",retry);
app.use('*',notFound);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

    // add this line to include winston logging
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);


    // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
