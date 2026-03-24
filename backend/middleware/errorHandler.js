
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error"

    //mongoose validation error
    if(err.name === "ValidationError"){
        statusCode = 400;
        message = Object.values(err.errors).map(error => error.message).json('. ')
    }

    //mongoose duplicate key
    if(err.code === 11000){
        statusCode = 400;
        message = 'Duplicate field value entered'
    }

    //jwt 
    if(err.name === 'JsonWebTokenError'){
        statusCode = 401;
        message = 'Invalid token'
    }

    if(err.name === 'TokenExpiredError'){
        statusCode = 401;
        message = 'Token expired'
    }

    console.error("Error", err)

    res.status(statusCode).json({
        success: false,
        error: message
    })
}

export default errorHandler