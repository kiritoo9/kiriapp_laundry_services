import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { getToken } from "../../helpers/token";
import { doUpload } from "../../helpers/upload";
import { getCategoryById } from "../categories/business";
import {
    getLists,
    getCount,
    getProductById,
    createProduct,
    updateProduct,
    createProductMaterial,
    getMaterialsByProduct,
    deleteProductMaterialByProduct
} from './business';

import Joi from "joi";
const schema = Joi.object({
    category_id: Joi.string().required(),
    name: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().allow(null),
    is_active: Joi.boolean().required().default(false),
    photo: Joi.string().allow(null),
    materials: Joi.array().items(Joi.object({
        material_id: Joi.string().required(),
        total_usage: Joi.number().allow(null),
        description: Joi.string().allow(null)
    })).allow(null).default([])
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
        let data: any = await getProductById(req.params?.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        data.materials = await getMaterialsByProduct(data.id);

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

        /**
         * Check existing category
         */
        const category = await getCategoryById(data?.category_id);
        if (!category) return res.status(404).json({ message: "Category is not found" });

        /**
         * Upload photo if exists
         */
        if (data.photo) {
            const uploaded = await doUpload(data.photo, "products");
            if (uploaded?.status) data["photo"] = uploaded?.filename;
        }

        /**
         * Insert data
         */
        const materials = data.materials;
        delete data.materials;

        await createProduct(data);
        await Promise.all(materials.map(async (v, _) => {
            await createProductMaterial({
                ...v,
                id: uuidv4(),
                product_id: data.id,
                created_at: data.created_at,
                created_by: data.created_by
            });
        }));

        /**
         * Response
         */
        return res.status(201).json({ message: "Data created", data });
    } catch (error: any) {
        console.log(error);
        return res.status(400).json({ error })
    }
}

async function edit(req: Request, res: Response) {
    try {
        const data = await getProductById(req.params?.id);
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
         * Check existing category
         */
        const category = await getCategoryById(body?.category_id);
        if (!category) return res.status(404).json({ message: "Category is not found" });

        /**
         * Upload photo if exists
         */
        if (body.photo) {
            const uploaded = await doUpload(body.photo, "products");
            if (uploaded?.status) body["photo"] = uploaded?.filename;
        } else {
            delete body.photo;
        }

        /**
         * Update data
         */
        const materials = body.materials;
        delete body.materials;

        await updateProduct(body);
        await deleteProductMaterialByProduct(body.id);
        await Promise.all(materials.map(async (v, _) => {
            await createProductMaterial({
                ...v,
                id: uuidv4(),
                product_id: data.id,
                created_at: data.created_at,
                created_by: data.created_by
            });
        }));

        /**
         * Response
         */
        return res.status(201).json({ message: "Data updated", data: body });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function remove(req: Request, res: Response) {
    try {
        const data = await getProductById(req.params.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        await updateProduct({
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