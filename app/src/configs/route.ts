import { Router } from "express";
import {
    lists,
    detail,
    edit
} from "./resolver";

class ConfigsRoute {
    public router = Router();
    constructor() {
        this.routes();
    }

    private routes() {
        this.router.get("/", lists);
        this.router.get("/:id", detail);
        this.router.put("/:id", edit);
    }
}

const configs = new ConfigsRoute().router;
export { configs }