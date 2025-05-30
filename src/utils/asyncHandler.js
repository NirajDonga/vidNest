
// requsterhandler is function which will exucate 
const asyncHandler = (requsteHandler) => {
    (req, res, next) => {
        Promise.resolve(requsteHandler(req, res, next))
        .catch((error) => next(error))
    }
};

export {asyncHandler};