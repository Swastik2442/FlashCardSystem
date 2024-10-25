import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";

function Validate(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    const errors = validationResult(req);
    if (errors.isEmpty())
        next();
    else {
        let error: { [key: string]: any } = {};
        errors.array().map((err: ValidationError) => (error[err.param] = err.msg));
        res.status(422).json({ error });
    }
};

export default Validate;
