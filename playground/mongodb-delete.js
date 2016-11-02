// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

const url = 'mongodb://localhost:27017/TodoApp';

MongoClient.connect(url , (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server', err);
    }
    console.log('Connected to MongoDB server');

    // deleteMany
    // delete all documents where text = 'Eat lunch'
    // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((res) => {
    //     console.log(res);
    // });

    // deleteOne
    // delete the first document where text = 'Eat lunch'
    // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((res) => {
    //     console.log(res);
    // });

    // findOneAndDelete
    // delete the firt document where text = 'Eat lunch' and return it
    // db.collection('Todos').findOneAndDelete({text: 'Eat lunch'}).then((res) => {
    //     console.log(res);
    // });

    // db.close();
});