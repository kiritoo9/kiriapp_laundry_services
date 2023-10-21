import { Request, Response } from "express";
import { getUserByEmail } from "../users/business";
import { configs } from "./../../configs/configs";
import * as jose from "jose";

import Joi from "joi";
const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});

async function login(req: Request, res: Response) {
    try {
        await schema.validateAsync(req.body);

        const user = await getUserByEmail(req.body.email);
        if (!user) return res.status(404).json({ message: "Email is not found" });

        /**
         * Validate password
         */
        const isMatch = await Bun.password.verify(req.body.password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Email and password does not match" });

        /**
         * Generate JWT Token
         */
        const SECRET_KEY = new TextEncoder().encode(configs.SECRET_KEY);
        const token = await new jose.SignJWT({
            user_id: user.id
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("30d")
            .sign(SECRET_KEY);

        /**
         * Response
         */
        return res.status(200).json({
            access_token: token
        });
    } catch (error) {
        return res.status(400).json({ error });
    }
}

export { login }