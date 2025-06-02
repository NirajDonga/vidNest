// requestHandler is function which will execute 
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .then(() => {})
        .catch((error) => next(error))  
    }
};

export {asyncHandler};