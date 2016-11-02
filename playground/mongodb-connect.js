// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server', err);
    }
    console.log('Connected to MongoDB server');

    // db.collection('Todos').insertOne({
    //     text: 'Someting to do',
    //     completed: false
    // }, (err, res) => {
    //     if (err) {
    //         return console.log('Unable to insert todo', err);
    //     }
    //     console.log(JSON.stringify(res.ops, undefined, 2));
    // });

    db.collection('Users').insertOne({
        name: 'John',
        age: 25,
        location: 'Portugal'
    }, (err, res) => {
        if (err) {
            return console.log('Unable to insert user', err);
        }
        console.log(JSON.stringify(res.ops, undefined, 2));
        console.log(res.ops[0]._id.getTimestamp());
    });

    db.close();
});