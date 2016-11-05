const {ObjectID} = require('mongodb');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
let port = process.env.PORT || 3000;

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (err) => {
        res.status(400).send(err);
    });
});

// GET /todos/1234567
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((err) => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((err) => res.status(400).send());
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};