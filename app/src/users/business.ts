import { Request } from "express"

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getLists(
    req: Request
) {
    let page: any = req.query?.page !== undefined ? req.query.page : 1;
    let limit: any = req.query?.limit !== undefined ? req.query.limit : 10;
    let keywords: any = req.query?.keywords !== undefined ? req.query.keywords : "";

    let offset = 0;
    if (page > 0 && limit > 0) offset = (page * limit) - limit;

    let data = await prisma.users.findMany({
        take: parseInt(limit),
        skip: offset,
        orderBy: {
            created_at: 'desc'
        },
        select: {
            id: true,
            usercode: true,
            email: true,
            fullname: true,
            phone: true,
            address: true,
            is_active: true
        },
        where: {
            OR: [
                {
                    deleted: false,
                    email: {
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    usercode: {
                        contains: keywords
                    }
                }
            ]
        }
    });

    return data;
}

async function getCount(
    req: Request
) {
    let limit: any = req.query?.limit !== undefined ? req.query.limit : 10;
    let keywords: any = req.query?.keywords !== undefined ? req.query.keywords : "";

    let count = await prisma.users.count({
        where: {
            OR: [
                {
                    deleted: false,
                    email: {
                        contains: keywords
                    }
                },
                {
                    deleted: false,
                    usercode: {
                        contains: keywords
                    }
                }
            ]
        }
    });

    let totalPage: number = 1;
    if (limit > 0 && count > 0) {
        totalPage = Math.ceil(count / limit);
    }
    return totalPage;
}

async function getDataById(id: string) {
    const data = await prisma.users.findFirst({
        where: {
            deleted: false,
            id
        },
    });
    return data;
}

export {
    getLists,
    getCount,
    getDataById
}