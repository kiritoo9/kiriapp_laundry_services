import { Router } from "express";
import { configs } from "../../configs/configs";

class WelcomeRoute {
    public router = Router();

    /**
     * List of routes
     * You can handle more function inside this constructor()
     */
    constructor() {
        this.routes();
    }

    private routes() {
        this.router.get("/", (_, res) => {
            res.status(200).send({
                "message": configs.APP_NAME,
                "version": configs.APP_VER
            });
        });
    }
}

const welcome = new WelcomeRoute().router;
export {
    welcome
}