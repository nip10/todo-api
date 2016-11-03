const mongoose = require('mongoose');
const dburl = 'mongodb://localhost:27017/TodoApp';

mongoose.Promise = global.Promise;
mongoose.connect(dburl);

module.exports = {mongoose};