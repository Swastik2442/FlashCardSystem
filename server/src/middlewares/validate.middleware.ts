import {
    Request as ExpressRequest,
    Response as ExpressResponse,
    NextFunction
} from "express";
import { validationResult } from "express-validator";

function Validate(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    const errors = validationResult(req);
    if (errors.isEmpty())
        next();
    else {
        const errorCount = errors.array().length
        res.status(422).json({
            status: "error",
            message: (
                errorCount > 1
                ? `${errorCount} Errors`
                : "An Error"
            ) + " occurred while processing the request",
            data: errors.mapped()
        });
    }
};

export default Validate;
