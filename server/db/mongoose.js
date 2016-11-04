const mongoose = require('mongoose');
const dburl = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp';

mongoose.Promise = global.Promise;
mongoose.connect(dburl);

module.exports = {mongoose};