const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// remove all Todos
// Todo.remove({}).then((res) => console.log(res));

// remove first Todo found and get info back
Todo.findOneAndRemove({_id: '581e0fc1db8250e3d6413549'}).then((todo) => {
    console.log(todo);
}); 

// remove Todo by id and get info back
// Todo.findByIdAndRemove


Todo.findByIdAndRemove('581e0fc1db8250e3d6413549').then((todo) => {
    console.log(todo);
});