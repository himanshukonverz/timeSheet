export class ErrorHandler extends Error{
    constructor(statusCode, message){
        super(message);
        this.statusCode = statusCode;
        this.stack = Error.captureStackTrace(this, this.constructor) || [];
    }
}