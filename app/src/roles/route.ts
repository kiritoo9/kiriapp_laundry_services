import { Router } from "express";
import {
    lists,
} from "./resolver";

class RolesRoute {
    public router = Router();
    constructor() {
        this.routes();
    }

    private routes() {
        this.router.get("/", lists);
    }
}

const roles = new RolesRoute().router;
export { roles }