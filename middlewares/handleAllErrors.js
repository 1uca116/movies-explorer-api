module.exports.handleAllErrors = (err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере ошибка'
      : message,
  });
  next();
};