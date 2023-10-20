import { Router } from "express";

class AuthRoute {
    public router = Router();
    constructor() {
        this.routes();
    }

    private routes() {
        this.router.post("/login", (_, res) => {
            res.status(200).send({
                "message": "This one is login auth",
            });
        });
    }
}

const auth = new AuthRoute().router;
export {
    auth
}