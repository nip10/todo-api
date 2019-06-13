# Todo API

[![Build Status](https://travis-ci.org/nip10/todo-api.svg?branch=master)](https://travis-ci.org/nip10/todo-api)
[![codecov](https://codecov.io/gh/nip10/todo-api/branch/master/graph/badge.svg)](https://codecov.io/gh/nip10/todo-api)

> A RESTful API to manage todos (add, edit, delete) with authentication (signup, signin), live [here](https://api.todo.diogocardoso.me)

## Getting Started

### Pre-requisites

- Node
- Yarn
- MongoDB

### Installing

- Install packages

```
yarn
```

- Build assets

```
yarn run build
```

- Edit .env.sample and rename to .env

```
MONGODB_URI= MongoDB url (for prod/dev)
MONGODB_URI_TEST= MongoDB url (for testing)
PORT= Express port
JWT_SECRET= long/random string
NODE_ENV= Environment (development, production, test)
```

### Developing

- Run in development mode

```
yarn run watch
```

### Production

- Run in production mode

```
yarn start
```

### Testing

- Run in test mode

```
yarn run test
```

- Run in test mode (+ watching)

```
yarn run test:watch
```

## Built With

- Typescript (v3)
- NodeJS (ES6)
- Express (Web Framework)
- Authentication: JWT
- Testing: Jest and Supertest.
- Postman config included

## Future improvements

- Increase test coverage

## API Documentation

TODO - check routes files for now

## Contributing

Feel free to submit PR's.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
