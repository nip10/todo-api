const mongoose = require('mongoose');
const dburl = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect(dburl);

module.exports = {mongoose};