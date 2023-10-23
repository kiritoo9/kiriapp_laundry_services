import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import Joi from "joi";

import {
    getLists,
    getCount,
    getUserById,
    getUserByEmail,
    getRoleByUser,
    createUser,
    updateUser,
    createUserRole,
    updateUserRole
} from './business';
import { getToken } from "../../helpers/token";

/**
 * Define input schema
 */
const schema = Joi.object({
    role_id: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().allow(null),
    fullname: Joi.string().required(),
    phone: Joi.string().allow(null),
    address: Joi.string().allow(null),
    is_active: Joi.boolean().default(false)
});

/**
 * Resolvers
 */
async function lists(req: Request, res: Response) {
    try {
        const data = await getLists(req);
        const totalPage = await getCount(req);

        return res.status(200).json({ data, totalPage });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function detail(req: Request, res: Response) {
    try {
        let data = await getUserById(req.params?.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        data["roles"] = await getRoleByUser(data?.id);

        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function create(req: Request, res: Response) {
    try {
        /**
         * Initiaize data
         */
        await schema.validateAsync(req.body);
        const token = await getToken(req);
        let body = {
            id: uuidv4(),
            email: req.body?.email,
            usercode: "",
            password: req.body?.password,
            fullname: req.body?.fullname,
            address: req.body?.address,
            phone: req.body?.phone,
            is_active: req.body?.is_active,
            created_at: new Date(),
            created_by: token?.usercode
        }

        /**
         * Check existing email
         */
        const user = await getUserByEmail(body.email);
        if (user) return res.status(400).json({ message: "Email is already exists!" });

        /**
         * Hash password
         */
        if (body.password == "") return res.status(400).json({ message: "Password cannot be empty" });
        const hashed = await Bun.password.hash(body.password, {
            algorithm: "bcrypt",
        });
        body.password = hashed;
        body.usercode = hashed.substring(3, 23);

        /**
         * Insert data
         */
        await createUser(body);
        await createUserRole({
            id: uuidv4(),
            user_id: body.id,
            role_id: req.body.role_id,
            created_at: body.created_at,
            created_by: body.created_by
        });

        /**
         * Response
         */
        return res.status(201).json({
            message: "Data inserted",
            data: body
        });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function edit(req: Request, res: Response) {
    try {
        /**
         * Initiaize data
         */
        await schema.validateAsync(req.body);
        const token = await getToken(req);
        let body: any = {
            id: req.params?.id,
            email: req.body?.email,
            fullname: req.body?.fullname,
            address: req.body?.address,
            phone: req.body?.phone,
            is_active: req.body?.is_active,
            updated_at: new Date(),
            updated_by: token?.usercode
        }

        /**
         * Check existing user
         */
        const exists = await getUserById(body.id);
        if (!exists) return res.status(404).json({ message: "Data is not found" });

        /**
         * Check existing email
         */
        let user = await getUserByEmail(body.email, body.id);
        if (!user) {
            user = await getUserByEmail(body.email);
            if (user) return res.status(400).json({ message: "Email is already exists!" });
        }

        /**
         * Hash password
         */
        if (req.body?.password !== undefined && req.body.password != "") {
            body["password"] = await Bun.password.hash(req.body.password, {
                algorithm: "bcrypt",
            });

        }

        /**
         * Update data
         */
        await updateUser(body);
        await updateUserRole({
            user_id: body.id,
            role_id: req.body.role_id,
            updated_at: body.updated_at,
            updated_by: body.updated_by
        });

        /**
         * Response
         */
        return res.status(201).json({
            message: "Data updated",
            data: body
        });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function remove(req: Request, res: Response) {
    try {
        const id = req.params.id;

        /**
         * Update data
         */
        await updateUser({
            id,
            deleted: true
        });

        /**
         * Response
         */
        return res.status(201).json({
            message: "Data deleted"
        });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

export {
    lists,
    detail,
    create,
    edit,
    remove
}