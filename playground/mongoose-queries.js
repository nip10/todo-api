const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

// const id = '581bdca7167bebaa8accf1b5';

// if (!ObjectID.isValid(id)) {
//     console.log('Invalid ID');
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('Id not found');
//     }
//     console.log('Todo by id', todo);
// }).catch((err) => console.log(err));

const {User} = require('./../server/models/user');

const id = '581a83997976a4af4032c26a';

User.findById(id).then((user) => {
    if (!user) {
        return console.log('User not found');
    }
    console.log('User by id', user);
}).catch((err) => console.log(err));