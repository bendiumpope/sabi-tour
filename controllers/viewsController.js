/* eslint-disable */
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');


exports.getOverview = catchAsync( async(req, res, next) => {
    //Get all Tour Data From COllection
    const tours = await Tour.find();

    //build template

    // render the template using the tour data from step1
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

 exports.getTour = catchAsync( async (req, res, next) => {
     const tour = await Tour.findOne({slug: req.params.slug}).populate({
         path: 'reviews',
         fields: 'review rating user'
     })

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
 });

 exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
 }