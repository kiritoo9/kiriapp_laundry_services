import { Request, Response, NextFunction } from 'express';

/**
 * Verify bearer token from client
 * Decoded JWT auth then check to database if user still valid or not
 */
async function verify(req: Request, res: Response, next: NextFunction) {

    let authorize = req.get('authorization');
    if (authorize) {
        const token = authorize.slice(7);
    } else {
        /**
         * Handler missing bearer token
         */
    }
    next();

}

export {
    verify
}