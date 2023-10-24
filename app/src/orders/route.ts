import { Router } from "express";
import {
    lists,
    detail,
    create,
    edit,
    editStatus,
    remove
} from "./resolver";

class OrdersRoute {
    public router = Router();
    constructor() {
        this.routes();
    }

    private routes() {
        this.router.get("/", lists);
        this.router.get("/:id", detail);
        this.router.post("/", create);
        this.router.put("/status/:id", editStatus);
        this.router.put("/:id", edit);
        this.router.delete("/:id", remove);
    }
}

const orders = new OrdersRoute().router;
export { orders }