const mongoose = require('mongoose');
const dburl = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect(dburl, {
    keepAlive: true,
    reconnectTries: Number.MAX_VALUE,
    useMongoClient: true
});

module.exports = {mongoose};