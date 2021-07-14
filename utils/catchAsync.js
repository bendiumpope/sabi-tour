/* eslint-disable prettier/prettier */
module.exports = fn => (req, res, next) => {
        fn(req, res, next).catch(next);
    };