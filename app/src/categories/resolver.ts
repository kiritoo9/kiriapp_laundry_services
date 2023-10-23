import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { getToken } from "../../helpers/token";
import {
    getLists,
    getCount,
    getCategoryById,
    createCategory,
    updateCategory
} from './business';

import Joi from "joi";
const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(null),
});

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
        const data = await getCategoryById(req.params?.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function create(req: Request, res: Response) {
    try {

        await schema.validateAsync(req.body);

        let data = req.body;
        const token = await getToken(req);
        data = {
            ...data,
            id: uuidv4(),
            created_at: new Date(),
            created_by: token?.usercode
        }
        await createCategory(data);

        return res.status(201).json({ message: "Data created", data });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function edit(req: Request, res: Response) {
    try {
        const data = await getCategoryById(req.params?.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        await schema.validateAsync(req.body);
        let body = req.body;
        const token = await getToken(req);
        body = {
            ...body,
            id: data.id,
            updated_at: new Date(),
            updated_by: token?.usercode
        }
        await updateCategory(body);

        return res.status(201).json({ message: "Data updated", data: body });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function remove(req: Request, res: Response) {
    try {
        const data = await getCategoryById(req.params.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        await updateCategory({
            id: data.id,
            deleted: true
        });
        return res.status(201).json({ message: "Data deleted" });
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