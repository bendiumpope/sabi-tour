/* eslint-disable prettier/prettier */
const Tour = require('../models/tourModel')
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');


exports.aliasTopTours = (req, res, next) => {

    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    
    next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync (async (req, res, next) => {

//         ///QUERY EXECUTION
//         const features = new APIFeatures(Tour.find(), req.query)
//             .filter()
//             .sort()
//             .limitFields()
//             .paginate();

//         const tours = await features.query;


//         res.status(200).json({
//             status: 'success',
//             requestedAt: req.requestTime,
//             results: tours.length,
//             data: {
//                 tours: tours
//             }
//         });       
// });

exports.createTour = factory.createOne(Tour);

// exports.createTour = catchAsync (async (req, res, next) => {

//         const newTour = await Tour.create(req.body);
      
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 tour: newTour
//             }
//         });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync (async (req, res, next) => {

//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404))
//     }

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 tour
//             }
//         });
// });

exports.updateTour = factory.updateOne(Tour);

// exports.updateTour = catchAsync (async (req, res, next) => {

//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    
//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404))
//     }
    
//     res.status(200).json({
//         status: 'success',
//             data: {
//                 tour
//             }
//         });
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync (async (req, res, next) => {

//         const tour = await Tour.findByIdAndDelete(req.params.id);

//         if (!tour) {
//             return next(new AppError('No tour found with that ID', 404))
//         }
            
//         res.status(204).json({
//             status: 'success',
//             data: null
//         });
// });

exports.getTourStats = catchAsync (async (req, res, next) => {

        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: {$gte: 4.5} }
            },
            {
                $group: {
                    _id: '$difficulty',
                    numTours: { $sum: 1},
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price'},
                    minPrice: { $min: '$price'},
                    maxPrice: { $max: '$price'}
                }
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
});

exports.getMonthlyPlan = catchAsync (async (req, res, next) => {

        const year = req.params.year * 1;
        
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 6
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });
});


// /tours-within/:distance/center/:latlng/unit/:unit

exports.getToursWithin = catchAsync(async (req, res, next) => {

    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;
    
    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    };

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius]} }});
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
    
})

// router
//     .route('/distance/:latlng/unit/:unit')
//     .get(tourController.getDistances);

exports.getDistances = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    
    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    };

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);
   
    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });        
});