var mongoose = require('mongoose');
var Schema = mongoose.Schema;

try {
    mongoose.connect(String(process.env.DB), {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log(error)
    console.log("could not connect");
}
const collectionName = 'reviews'

// Review schema
var ReviewSchema = new Schema({
    "movieId": {
        type: mongoose.Schema.Types.ObjectId, ref: 'Movie' ,
        required: true
    },
    "username": {
        type: String,
        required: true
    },
    "review": {
        type: String,
        required: true
    },
    "rating": {
        type: Number, min: 0, max: 5 , 
        required: true
    }

    
});


// return the model
module.exports = mongoose.model('Review', ReviewSchema);