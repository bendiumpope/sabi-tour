/* eslint-disable */
const mongoose = require('mongoose');
// const slugify = require('slugify');
// const User = require('./userModel');
const Tour = require('./tourModel');

// const validator = require('validator');


const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true,'Review must not be empty'],
        trim: true
        // validate: [validator.isAlpha, 'A tour name must only contain characters']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    ///Referencing the tour using their ID
    tour: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, "Review must belong to a tour"]
        }
    ],
    ///Referencing the user using their ID
    user: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, "Review must belong to a user"]
        }
    ]    
}, 

{
    toJSON:{ virtuals: true },
    toObject: { virtual: true }
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
///populating the guides field using referencing
reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // });
    this.populate({
        path: 'user',
        select: 'name photo'
    });   

    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1},
                avgRating: { $avg: '$rating'}
            }
        }
    ]);

    if (stats.length > 0){
        
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    }else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

reviewSchema.post('save', function() {
   this.constructor.calcAverageRatings(this.tour);

});

//findByIdAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();

    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
