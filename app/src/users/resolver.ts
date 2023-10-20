import { Request, Response } from 'express';
import {
    getLists,
    getCount,
    getDataById
} from './business';

async function lists(req: Request, res: Response) {
    const data = await getLists(req);
    const totalPage = await getCount(req);

    return res.status(200).json({ data, totalPage });
}

async function detail(req: Request, res: Response) {
    const data = await getDataById(req.params?.id);

    if (!data) return res.status(404).json({ "message": "Data is not found" });
    return res.status(200).json(data);
}

export {
    lists,
    detail
}