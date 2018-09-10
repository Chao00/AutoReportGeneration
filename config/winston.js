var appRoot = require('app-root-path');
var winston = require('winston');
/*
This is the log configuration settings
Logs at debug level and above are printed to the console.
Logs at info level and above are both printed to the console and stored in 'logs/combined.log'
Logs at error level are both printed to the console and stored in 'logs/error.log'
 */

// define the custom settings for each transport (file, console)
var options = {
    fileError: {
        level: 'error',
        filename: `${appRoot}/logs/error.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    fileInfo: {
        level: 'info',
        filename: `${appRoot}/logs/combined.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

// instantiate a new Winston Logger with the settings defined above
var logger = winston.createLogger({
    transports: [
        new winston.transports.File(options.fileError),
        new winston.transports.File(options.fileInfo),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function(message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

module.exports = logger;