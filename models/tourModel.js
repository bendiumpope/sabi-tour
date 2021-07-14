/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

// const validator = require('validator');


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must be less than or equal to 40 characters '],
        minlength: [5, 'A tour name must be more than or equal to 5 characters ']
        // validate: [validator.isAlpha, 'A tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },    
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },    
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },    
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
            return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below the regular price'    
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a discription']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoJSON to specifiy Geospacial data
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    ///Referencing the guide using their ID
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},

{
    toJSON:{ virtuals: true },
    toObject: { virtual: true }
});

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});
   
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
});

//VIRTUAL POPULATE OF CHILD ON PARENT
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

///DOCUMENTS MIDDLEWARE Runs before .save() and .create()/////
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, { lower: true });
    next();
});

///For embedding documents in our database
// tourSchema.pre('save', async function(next) {
    
//     const guidesPromises = this.guides.map(async id => User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
    
//     next();   
// });

/////QUERY MIDDLEWARE/////
tourSchema.pre(/^find/, function(next){
    this.find({ secretTour: { $ne: true }});
    next();
});

///populating the guides field using referencing
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })

    next();
});

///// AGGREGATION MIDDLEWARE ////////
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().ushift({ $match: { secretTour: { $ne: true }}})
//     next();
// });


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
