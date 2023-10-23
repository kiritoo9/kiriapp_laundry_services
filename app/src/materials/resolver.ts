import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { getToken } from "../../helpers/token";
import {
    getLists,
    getCount,
    getMaterialById,
    createMaterial,
    updateMaterial
} from './business';

import {
    getUomById
} from './../uoms/business';

import Joi from "joi";
import { doUpload } from "../../helpers/upload";
const schema = Joi.object({
    uom_id: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().allow(null),
    buy_price: Joi.number().required(),
    max_usage: Joi.number().required(),
    stock: Joi.number().required(),
    photo: Joi.string().allow(null),
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
        const data = await getMaterialById(req.params?.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function create(req: Request, res: Response) {
    try {

        await schema.validateAsync(req.body);
        let data: any = req.body;
        const token = await getToken(req);
        data = {
            ...data,
            id: uuidv4(),
            created_at: new Date(),
            created_by: token?.usercode
        }

        /**
         * Check existing UOM
         */
        const uom = await getUomById(data.uom_id);
        if (!uom) return res.status(404).json({ message: "UOM is not found or has been deleted, try another one" });

        /**
         * Upload photo if there is any
         */
        if (data.photo) {
            const uploaded = await doUpload(data.photo, "materials");
            if (uploaded?.status) data["photo"] = uploaded?.filename;
        }

        /**
         * Create material
         */
        await createMaterial(data);

        return res.status(201).json({ message: "Data created", data });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function edit(req: Request, res: Response) {
    try {
        const data = await getMaterialById(req.params?.id);
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

        /**
         * Check existing UOM
         */
        const uom = await getUomById(body.uom_id);
        if (!uom) return res.status(404).json({ message: "UOM is not found or has been deleted, try another one" });

        /**
         * Upload photo if there is any
         */
        if (data.photo) {
            const uploaded = await doUpload(data.photo, "materials");
            if (uploaded?.status) data["photo"] = uploaded?.filename;
        } else {
            delete body.photo; // Prevent to not update field "photo" if user set as null (not upload any file)
        }

        /**
         * Update material
         */
        await updateMaterial(body);

        return res.status(201).json({ message: "Data updated", data: body });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function remove(req: Request, res: Response) {
    try {
        const data = await getMaterialById(req.params.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        await updateMaterial({
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