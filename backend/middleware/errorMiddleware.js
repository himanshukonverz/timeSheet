export const errorMiddleware = async (err, req, res, next) => {
    err.message ||= "Something went wrong";
    err.statusCode ||= 500;

    res.status(err.statusCode).json({
        success : false,
        message : err.message,
        err
    })
}