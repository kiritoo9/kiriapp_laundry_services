import { Request, Response } from "express";
import { getToken } from "./../../helpers/token";
import {
    getLists,
    getCount,
    getConfigById,
    updateConfig
} from './business';

import Joi from "joi";
const schema = Joi.object({
    config_value: Joi.string().required(),
    config_key: Joi.string().allow(null)
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
        const data = await getConfigById(req.params?.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        return res.status(200).json(data);
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

async function edit(req: Request, res: Response) {
    try {
        /**
         * Check existing data
         */
        const data = await getConfigById(req.params?.id);
        if (!data) return res.status(404).json({ message: "Data is not found" });

        /**
         * Validate and update
         */
        await schema.validateAsync(req.body);
        const token = await getToken(req);
        const config = {
            id: data.id,
            config_value: req.body.config_value,
            config_key: req.body.config_key,
            updated_at: new Date(),
            updated_by: token?.usercode
        }
        await updateConfig(config);

        return res.status(201).json({ message: "Config updated", data: config });
    } catch (error: any) {
        return res.status(400).json({ error })
    }
}

export {
    lists,
    detail,
    edit
}