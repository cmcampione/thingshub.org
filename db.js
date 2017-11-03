var mongoose = require('mongoose');
mongoose.connect('omngodb://user:password@server1.carmelocampione.it:27017/securing-rest-apis-with-jwt', 
{ 
    useMongoClient: true
});