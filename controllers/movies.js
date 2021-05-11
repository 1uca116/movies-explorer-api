const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id})
    .then(movies => res.send({ data: movies.reverse() }))
    .catch(next);
};


module.exports.createMovie = (req, res, next) => {
  const {
    movieId,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
  } = req.body;
  Movie.create({
      movieId,
      country,
      director,
      duration,
      year,
      description,
      image,
      trailer,
      nameRU,
      nameEN,
      thumbnail,
      owner:req.user._id,
    })
    .then(movie => {
      if (!movie) {
        throw new BadRequestError('Переданы некорректные данные');
      }
      res.send({data: movie});

    }).catch(next);
}

module.exports.deleteMovie = (req, res, next) => {
 const { movieId } = req.params;
 const owner = req.user._id;
 Movie.findById(movieId)
   .orFail(() => {throw new NotFoundError('Фильм не найден'); })
   .then((movie) => {
     if (movie.owner.toString() !== owner) {
       throw new ForbiddenError('Вы не можете удалить фильм');
     }
     return Movie.findByIdAndRemove(movieId);
   })
   .then((movie) => res.send(movie))
   .catch(next);
};



