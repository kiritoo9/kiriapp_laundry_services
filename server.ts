import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { configs } from "./app/configs/configs";
import { verify } from "./app/middlewares/permission";

/**
 * Loads routers
 */
import { welcome } from "./app/src/welcome/route";
import { auth } from "./app/src/auth/route";
import { users } from "./app/src/users/route";
import { roles } from "./app/src/roles/route";
import { configs as configRoutes } from "./app/src/configs/route";
import { customers } from "./app/src/customers/route";
import { categories } from "./app/src/categories/route";
import { uoms } from "./app/src/uoms/route";
import { materials } from "./app/src/materials/route";

const app = express();

/**
 * Configs
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(cors());
app.use(express.static(__dirname + "/cdn"));

/**
 * Init routes
 */
app.use("/", welcome);
app.use("/auth", auth);

/**
 * Init routes with middleware for specific routes
 */
app.use("/users", verify, users);
app.use("/roles", verify, roles);
app.use("/configs", verify, configRoutes);
app.use("/customers", verify, customers);
app.use("/categories", verify, categories);
app.use("/uoms", verify, uoms);
app.use("/materials", verify, materials);

/**
 * Routes error handler
 */
app.use("*", (_, res) => {
  res.status(404).json({
    "message": "Route is not found, seems like you are lost",
  });
});

/**
 * Run App
 */
app.listen(configs.APP_PORT, () => {
  console.info(`[${new Date()}] - Listening on port ${configs.APP_PORT}`);
});
