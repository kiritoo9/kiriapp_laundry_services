import { Request, Response } from "express";
const { v4: uuidv4 } = require('uuid')
import {
    getLists,
    getCount,
    getUserById,
    getUserByEmail,
    createUser
} from './business';

async function lists(req: Request, res: Response) {
    try {
        const data = await getLists(req);
        const totalPage = await getCount(req);

        return res.status(200).json({ data, totalPage });
    } catch (error: any) {
        return res.status(400).json({ error: error?.message })
    }
}

async function detail(req: Request, res: Response) {
    try {
        const data = await getUserById(req.params?.id);

        if (!data) return res.status(404).json({ message: "Data is not found" });
        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(400).json({ error: error?.message })
    }
}

async function create(req: Request, res: Response) {
    try {
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
            created_by: "DATA_INJECTED"
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
        body.usercode = hashed.substring(3, 10);

        /**
         * Insert data
         */
        await createUser(body);

        /**
         * Response
         */
        return res.status(201).json({
            message: "Data inserted",
            data: body
        });
    } catch (error: any) {
        return res.status(400).json({ error: error?.message })
    }
}

async function edit(req: Request, res: Response) {

}

async function remove(req: Request, res: Response) {

}

export {
    lists,
    detail,
    create,
    edit,
    remove
}