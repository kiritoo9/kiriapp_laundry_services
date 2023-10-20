import { Router } from "express";
import {
    lists,
    detail
} from "./resolver";

class UsersRoute {
    public router = Router();
    constructor() {
        this.routes();
    }

    private routes() {
        this.router.get("/", lists);
        this.router.get("/:id", detail);
    }
}

const users = new UsersRoute().router;
export {
    users
}