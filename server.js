/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

///Handling Unhandled Uncaught Exception (synchronous error)
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTIONS ......Shutting down.')
    console.log(err.name, err.message);
    process.exit(1)
   
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose
    .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
    })
    .then( con => console.log('DB Connected Successfully'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => { 
    console.log(`Server started on port ${port}`);
});

///Handling Unhandled Promise Rejection
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION ......Shutting down.')
    console.log(err.name, err.message);
    // console.log(err.stack)
    
    server.close(() => {
        process.exit(1)
    });
   
});


//console.log(X)