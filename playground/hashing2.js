const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const password = '123abc!';

// bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(password, salt, (err, hash) => {
//         console.log(hash);
//     });
// });

const hashedPassword = '$2a$10$75xgBVsqlrC2Pd3hmhPIY.m971PW34vYVgIOve7nNMbX9QN6HcnBa';

bcrypt.compare(password, hashedPassword, (err, res) => {
    console.log(res);
});