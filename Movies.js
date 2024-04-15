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
var MovieSchema = new Schema({
    "title": {
        type: String,
        required: true
    },
    "releaseDate": {
        type: Number,
        required: true
    },
    "genre": {
        type: String,
        required: true
    },
    "actors": {
        type: [{
            "actorName": String,
            "characterName": String,
        }], 
        required: true
    }
    
});


// return the model
module.exports = mongoose.model('Movie', MovieSchema);