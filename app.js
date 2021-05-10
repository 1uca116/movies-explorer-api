/* eslint-disable no-unused-vars */
const express = require('express');
const mongoose = require('mongoose');
 const bodyParser = require('body-parser');
// const usersRouter = require('./routes/users.js');
// const cardsRouter = require('./routes/cards');
const NotFoundError = require('./errors/not-found-error');
require('dotenv').config();
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { handleAllErrors } = require('./middlewares/handleAllErrors')
const Routes = require('./routes');
// const { celebrate, Joi } = require('celebrate');
// const { login, createUser } = require('./controllers/users');
// const auth = require('./middlewares/auth');
const { PORT = 3000 } = process.env;
const app = express();

app.use(cors());
app.options('*', cors());

mongoose.connect('mongodb://localhost:27017/movies', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use('/', Routes);
app.use(errorLogger);
app.use(requestLogger);
app.use(handleAllErrors);

console.log(process.env.NODE_ENV);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})






