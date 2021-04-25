import request, { Response } from 'supertest';
import { Types } from 'mongoose';

import app from '../app';
import Todo from '../models/todo';
import User from '../models/user';
import { todos, populateTodos, users, populateUsers } from './seed/seed';

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', () => {
    return new Promise((done) => {
      const text = 'Test todo text';
      return request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({ text })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.text).toBe(text);
        })
        .end((err: any, res) => {
          if (err) {
            return done(err);
          }
          return Todo.find({ text })
            .then((dbTodos) => {
              expect(dbTodos.length).toBe(1);
              expect(dbTodos[0].text).toBe(text);
              done('ok');
            })
            .catch((err2: any) => done(err2));
        });
    });
  });

  it('should not create todo with invalid body data', () =>
    new Promise((done) =>
      request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send()
        .expect(400)
        .end((err: any, res) => {
          if (err) {
            return done(err);
          }
          return Todo.find()
            .then((dbTodos) => {
              expect(dbTodos.length).toBe(2);
              done('ok');
            })
            .catch((err2) => done(err2));
        }),
    ));
});

describe('GET /todos', () => {
  it('should get all todos', () =>
    new Promise((done) =>
      request(app)
        .get('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.length).toBe(1);
        })
        .end(done),
    ));
});

describe('GET /todos/:id', () => {
  it('should return todo doc', () =>
    new Promise((done) =>
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.text).toBe(todos[0].text);
        })
        .end(done),
    ));

  it('should not return todo doc created by other user', () =>
    new Promise((done) =>
      request(app)
        .get(`/todos/${todos[1]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done),
    ));

  it('should return 404 if todo not found', () => {
    return new Promise((done) => {
      const hexId = new Types.ObjectId().toHexString();
      return request(app).get(`/todos/${hexId}`).set('x-auth', users[0].tokens[0].token).expect(404).end(done);
    });
  });

  it('should return 400 if ObjectId is invalid', () => {
    return new Promise((done) => {
      const id = '123';
      return request(app).get(`/todos/${id}`).set('x-auth', users[0].tokens[0].token).expect(400).end(done);
    });
  });
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', () => {
    return new Promise((done) => {
      const hexId = todos[1]._id.toHexString();
      return request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body._id).toBe(hexId);
        })
        .end((err: any, res) => {
          if (err) {
            return done(err);
          }
          return Todo.findById(hexId)
            .then((todo) => {
              expect(todo).toBeNull();
              done('ok');
            })
            .catch((err2) => done(err2));
        });
    });
  });

  it('should not remove a todo created by other user', () => {
    return new Promise((done) => {
      const hexId = todos[0]._id.toHexString();
      return request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end((err: any, res) => {
          if (err) {
            return done(err);
          }
          return Todo.findById(hexId)
            .then((todo) => {
              expect(todo).not.toBeNull();
              done('ok');
            })
            .catch((err2) => done(err2));
        });
    });
  });

  it('should return 404 if todo not found', () => {
    return new Promise((done) => {
      const hexId = new Types.ObjectId().toHexString();
      return request(app).delete(`/todos/${hexId}`).set('x-auth', users[1].tokens[0].token).expect(404).end(done);
    });
  });

  it('should return 400 if ObjectId is invalid', () => {
    return new Promise((done) => {
      const id = '123';
      return request(app).delete(`/todos/${id}`).set('x-auth', users[1].tokens[0].token).expect(400).end(done);
    });
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', () => {
    return new Promise((done) => {
      const hexId = todos[0]._id.toHexString();
      const text = 'Edited todo';
      return request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({ text, completed: true })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.text).toBe(text);
          expect(res.body.completed).toBe(true);
          expect(typeof res.body.completedAt).toBe('number');
        })
        .end(done);
    });
  });

  it('should not update the todo created by other user', () => {
    return new Promise((done) => {
      const hexId = todos[0]._id.toHexString();
      const text = 'Edited todo';
      return request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({ text, completed: true })
        .expect(404)
        .end(done);
    });
  });

  it('should clear completedAt when todo is not completed', () => {
    return new Promise((done) => {
      const hexId = todos[1]._id.toHexString();
      const text = 'Edited todo v2';
      return request(app)
        .patch(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({ text, completed: false })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.text).toBe(text);
          expect(res.body.completed).toBe(false);
          expect(res.body.completedAt).toBeNull();
        })
        .end(done);
    });
  });
  it('should return 400 if ObjectId is invalid', () => {
    return new Promise((done) => {
      const todoId = '!!!!!!!!!!!!!!!!!!!!!';
      return request(app)
        .patch(`/todos/${todoId}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(400)
        .expect((res: Response) => {
          expect(res.body.todo).toBeUndefined();
        })
        .end(done);
    });
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', () =>
    new Promise((done) =>
      request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done),
    ));
  it('should return 401 if not authenticated', () =>
    new Promise((done) =>
      request(app)
        .get('/users/me')
        .expect(401)
        .expect((res: Response) => {
          expect(res.body).toEqual({});
        })
        .end(done),
    ));
});

describe('POST /users', () => {
  it('should create an user', () => {
    return new Promise((done) => {
      const email = 'example@example.com';
      const password = '123mnb!';
      return request(app)
        .post('/users')
        .send({ email, password })
        .expect(201)
        .expect((res: Response) => {
          expect(res.header['x-auth']).not.toBeNull();
          expect(res.body._id).not.toBeNull();
          expect(res.body.email).toBe(email);
        })
        .end((err) => {
          if (err) {
            return done(err);
          }
          return User.findOne({ email })
            .then((user) => {
              expect(user).not.toBeNull();
              expect(user!.password).not.toBe(password);
              done('ok');
            })
            .catch((err2) => done(err2));
        });
    });
  });
  it('should return validation errors if request is invalid', () => {
    return new Promise((done) => {
      const email = 'andrewexample.com';
      const password = '123';
      return request(app).post('/users').send({ email, password }).expect(400).end(done);
    });
  });
  it('should not create user if email in use', () => {
    return new Promise((done) => {
      const { email } = users[0];
      const password = 'Password123!';
      return request(app).post('/users').send({ email, password }).expect(400).end(done);
    });
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', () =>
    new Promise((done) =>
      request(app)
        .post('/users/login')
        .send({
          email: users[1].email,
          password: users[1].password,
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.header['x-auth']).not.toBeNull();
        })
        .end((err: any, res) => {
          if (err) {
            return done(err);
          }
          return User.findById(users[1]._id)
            .then((user) => {
              expect(user).not.toBeNull();
              expect(user!.tokens[1]).toHaveProperty('access', 'auth');
              expect(user!.tokens[1]).toHaveProperty('token', res.header['x-auth']);
              done('ok');
            })
            .catch((err2) => done(err2));
        }),
    ));
  it('should reject invalid login (wrong password)', () =>
    new Promise((done) =>
      request(app)
        .post('/users/login')
        .send({
          email: users[1].email,
          password: `${users[1].password}1`,
        })
        .expect(400)
        .expect((res: Response) => {
          expect(res.header['x-auth']).toBeUndefined();
          expect(res.body.error).toBeDefined();
        })
        .end((err: any, res) => {
          if (err) {
            return done(err);
          }
          return User.findById(users[1]._id)
            .then((user) => {
              expect(user).not.toBeNull();
              expect(user!.tokens.length).toBe(1);
              done('ok');
            })
            .catch((err2) => done(err2));
        }),
    ));
  it('should reject invalid login (wrong email)', () =>
    new Promise((done) =>
      request(app)
        .post('/users/login')
        .send({
          email: `a${users[1].email}`,
          password: users[1].password,
        })
        .expect(500)
        .expect((res: Response) => {
          expect(res.header['x-auth']).toBeUndefined();
        })
        .end((err: any, res) => {
          if (err) {
            return done(err);
          }
          return User.findById(users[1]._id)
            .then((user) => {
              expect(user).not.toBeNull();
              expect(user!.tokens.length).toBe(1);
              done('ok');
            })
            .catch((err2) => done(err2));
        }),
    ));
  it('should reject invalid login (invalid email - validation error)', () =>
    new Promise((done) =>
      request(app)
        .post('/users/login')
        .send({
          email: 'not_@an_email',
          password: 'doesnt_matter',
        })
        .expect(400)
        .expect((res: Response) => {
          expect(res.header['x-auth']).toBeUndefined();
          expect(res.body).toHaveProperty('error', 'Invalid email address');
        })
        .end((err: any, res) => {
          if (err) {
            return done(err);
          }
          return User.findById(users[1]._id)
            .then((user) => {
              expect(user).not.toBeNull();
              expect(user!.tokens.length).toBe(1);
              done('ok');
            })
            .catch((err2) => done(err2));
        }),
    ));
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', () =>
    new Promise((done) =>
      request(app)
        .delete('/users/me/token')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end((err: any, res) => {
          if (err) {
            return done(err);
          }
          return User.findById(users[0]._id)
            .then((user) => {
              expect(user).not.toBeNull();
              expect(user!.tokens.length).toBe(0);
              done('ok');
            })
            .catch((err2) => done(err2));
        }),
    ));
});

describe('GET undefined route', () => {
  it('should return 404 status and an error property', () =>
    new Promise((done) =>
      request(app)
        .get('/made/up/route')
        .expect(404)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('error', 'Page Not Found.');
        })
        .end(done),
    ));
});
