const Users = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ConflictError = require('../errors/conflict-error');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');


module.exports.getUser = (req, res, next) => {
  Users.findById(req.user._id)
    .then(user => {
      if (!user) {
        throw new NotFoundError('Такого пользователя нет');
      }
      res.send({data: user});
    })
    .catch(err => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'))
      } else {
        next(err);
      }
    });
}

module.exports.createUser = (req, res, next) => {
  const {name,  email, password} = req.body;
  Users.findOne({email})
    .then(user => {
      if (user) {
        throw new ConflictError('Эти данные уже используются. Введите другой email');
      }
      bcrypt.hash(password, 10)
        .then((hash) => {
          Users.create({name, email, password: hash})
            .then(user => {
              if (!user) {
                throw new BadRequestError('Переданы некорректные данные');
              }
              res.send({data: {
                  name: user.name,
                  email: user.email,
                  _id: user._id,
                }});
            })
            .catch(err => {
              if (err.name === 'ValidationError') {
                next(new BadRequestError('Переданы некорректные данные'));
              } else {
                next(err);
              }
            });
        })
        .catch(next);
    })
    .catch(next);
}

module.exports.updateUser = (req, res, next) => {
  const {name, email} = req.body;
  const _id = req.user._id;
  Users.findByIdAndUpdate(
    _id,
    {name, email},
    {new: true, runValidators: true}
  )
    .then(user => {
      if (!user) {
        throw new NotFoundError('Такого пользователя нет');
      }
      res.send({data: user});
    })
    .catch(err => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'))
      } else {
        next(err);
      }
    });
}

module.exports.login = (req, res) => {
  const {email, password} = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;

  return Users.findUserByCredentials(email, password)
    .then((matched) => {

      const token = jwt.sign(
        { _id: matched._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'qwerty1234',
        {expiresIn: '7d'}
      );


      if (!matched) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true
      })
        .status(200).send({token})
    })
    .catch((err) => {
      console.log(err)
      res
        .status(401)
        .send({message: err.message});
    });
};
