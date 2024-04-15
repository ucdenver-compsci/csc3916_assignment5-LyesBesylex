/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')
.get((req, res) => {
    Movie.find({}, function (err, movies) {
        if (err) {
            // Handle error if any
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            // If no error, send the retrieved movies
            res.json(movies);
        }
    });
    })
    .post((req, res) => {
        if (!req.body.title || !req.body.actors || !req.body.genre|| !req.body.releaseDate) {
            res.json({success: false, msg: 'Please include all information about movie (Title, actors, genre, releaseDate)'})
        } 
        else if (!Array.isArray(req.body.actors) || req.body.actors.length < 3) {
            res.json({ success: false, msg: 'Please provide at least three actor for the movie.' });
        }
        else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.actors = req.body.actors;
            movie.genre = req.body.genre;
            movie.releaseDate= req.body.releaseDate;
    
            movie.save(function(err){
                if (err) {
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'That movie already exists'});
                    else
                        return res.json(err);
                }
    
                res.json({success: true, msg: 'Successfully created new movie.'})
            });
        }
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        res.status(405).send({ message: 'HTTP method not supported.' });
    })
    .delete(authController.isAuthenticated, (req, res) => {
        res.status(405).send({ message: 'HTTP method not supported.' });
    })
    .all((req, res) => {
        // Any other HTTP Method
        // Returns a message stating that the HTTP method is unsupported.
        res.status(405).send({ message: 'HTTP method not supported.' });
    });

router.route('/movies/:MovieId')
    .get((req, res) => {
        const MovieId = req.params.MovieId;
        Movie.findOne({title: MovieId}, function (err, movie) {
            console.log(movie);
            if (err) {
                // Handle error if any
                res.status(500).json({ success: false, message: 'Internal Server Error' });
            } 
            else if (req.query.reviews == "true"){
                // Aggregate the reviews of this movie 
                console.log(req.query.reviews)
                Review.find({movieId: movie._id}, function(err, reviews) {
                    if (err) {
                        // Handle error if any
                        res.status(500).json({ success: false, message: 'Internal Server Error' });
                    } else {
                        res.json({ success: true, movie: movie, reviews: reviews });
                    }
                });
            }
            else  {
                // If no error, send the retrieved movie
                console.log(req.query.reviews)
                res.json({ success: true, movies: movie });
            }
        });
        })//Working
    .post((req, res) => {
            res.status(405).send({ message: 'HTTP method not supported.' });
        }) //Working
    .put(authJwtController.isAuthenticated, (req, res) => {
            const MovieId = req.params.MovieId;
            var newvalues = { $set: req.body};

            Movie.updateOne({title: MovieId}, newvalues, function (err, movie) {
                if (err) {
                    // Handle error if any
                    res.status(500).send({ message: "Error in update Movies/:movieid" });
                } else {
                    // send back the updated movie information
                    res.json({ success: true, movies: movie });
                }
            });

        })//Working
    .delete(authController.isAuthenticated, (req, res) => {
            const MovieId = req.params.MovieId;

            Movie.deleteOne({title: MovieId}, function (err, movie) {
                if (err) {
                    // Handle error if any
                    res.status(500).send({ message: "Error in delete Movies/:movieid" });
                } else {
                    // If no error, send the retrieved movie
                    res.status(404).send({ message: "Successfully Deleted" });
                }
            });

        }) //Working
        .all((req, res) => {
            // Any other HTTP Method
            // Returns a message stating that the HTTP method is unsupported.
            res.status(405).send({ message: 'HTTP method not supported.' });
        });
    
router.route('/reviews')
    .get((req, res) => {
        Review.find({}, function (err, reviews) {
            if (err) {
                // Handle error if any
                res.status(500).json({ success: false, message: 'Internal Server Error' });
            } else {
                // If no error, send the retrieved movies
                res.json(reviews);
            }
        });
        })

   .post(authJwtController.isAuthenticated, (req, res) => {
        if (!req.body.movieId || !req.body.username || !req.body.review || !req.body.rating) {
            res.json({success: false, msg: 'Please include all information about movie (title, username, review, rating)'})
        } 
        else if (req.body.rating > 5 || req.body.rating < 0) {
            res.json({ success: false, msg: 'Please make sure that the rating is between 0 and 5' });
        }
        else {
            var review = new Review();
            var movie = new Movie();
            console.log(req.body.movieId);
            Movie.findOne({_id: req.body.movieId}, function (err, movie) {
                if (err) {
                    // Handle error if any
                    res.status(500).json({ success: false, msg: 'Movie does not exist in the movie collection. Add the Movie first.' });
                } else {
                    review.movieId = req.body.movieId;
                    review.username = req.body.username ;
                    review.review = req.body.review;
                    review.rating= req.body.rating;
                    
                    console.log(review)

                    review.save(function(err){
                        if (err) {
                            res.status(500).json({success: false, msg: 'Error saving the review.'});
                        } else {
                            res.json({success: true, msg: 'Successfully created new review!'});
                        }
                    });
                }
            });
            

        }
    })

app.use('/', router);
app.listen(process.env.PORT || 3000);
module.exports = app; // for testing only





