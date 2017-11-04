var mongoose = require('mongoose');
var User = require('./user/User');

mongoose.Promise = global.Promise;

var promise = mongoose.connect('mongodb://server:port/dbname', 
{ 
    useMongoClient: true,
    auth: {authSource: "admin"},
    user: "username",
    pass: "password"
});

promise.catch(function(err) {
    console.log(err);
})
