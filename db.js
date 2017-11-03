var mongoose = require('mongoose');
mongoose.connect('mongodb://superUser:aviremu@server1.carmelocampione.it:27017/securing-rest-apis-with-jwt', 
{ 
    useMongoClient: true
});