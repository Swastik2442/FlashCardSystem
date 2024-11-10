import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";

function Validate(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    const errors = validationResult(req);
    if (errors.isEmpty())
        next();
    else {
        let errorCount = 0;
        const error: Record<string, unknown> = {};
        errors.array().map((err: ValidationError) => {
            error[err.param] = err.msg;
            errorCount++;
        });
        res.status(422).json({
            status: "error",
            message: (errorCount > 1 ? `${errorCount} Errors` : "An Error") + " occured while processing the request",
            data: error
        });
    }
};

export default Validate;
