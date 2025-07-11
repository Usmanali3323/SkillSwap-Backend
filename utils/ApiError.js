class ApiError{
    constructor(
        statusCode,
        error=[],
        message=" Something went wrong ",
        stack=""
        ){
       this.statusCode=statusCode;
       this.message=message;
       this.error=error;
       this.success=false;
        }
}

export {ApiError}