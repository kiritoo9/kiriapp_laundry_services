import { Request, Response } from "express";

import {
    getLists,
    getCount
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

export {
    lists
}