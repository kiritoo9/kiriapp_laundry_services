import { Router } from "express";
import {
    login
} from "./resolver";

class AuthRoute {
    public router = Router();
    constructor() {
        this.routes();
    }

    private routes() {
        this.router.post("/login", login);
    }
}

const auth = new AuthRoute().router;
export {
    auth
}