var mongoose = require('mongoose');
var Schema = mongoose.Schema;

try {
    mongoose.connect(String(process.env.DB), {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log(error)
    console.log("could not connect");
}
const collectionName = 'movies'

// Movie schema
const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    releaseDate: { type: Number, min: [1900, 'Must be greater than 1899'], max: [2100, 'Must be less than 2100']},
    genre: { type: String, enum: genres },
    actors: [ActorSchema],
    imageUrl: String
  });

// return the model
module.exports = mongoose.model('Movie', MovieSchema);