import { Router } from "express";
import {
    lists,
    detail,
    create,
    edit,
    remove
} from "./resolver";

class ProductsRoute {
    public router = Router();
    constructor() {
        this.routes();
    }

    private routes() {
        this.router.get("/", lists);
        this.router.get("/:id", detail);
        this.router.post("/", create);
        this.router.put("/:id", edit);
        this.router.delete("/:id", remove);
    }
}

const products = new ProductsRoute().router;
export { products }